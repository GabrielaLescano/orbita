import postcss from "postcss";
import type { AtRule, Node, Root } from "postcss";

export const MAX_CSS_CHARS = 30_000;

const DEFAULT_SCOPE = ".profile-content";
const MAX_Z_INDEX = 10;


/* En los comentarios se deja explicado lo que se bloque en el sanitizado */

export type SanitizeCssOptions = {
  scope?: string;
  /**
   * Si se indica, las URLs de imágenes solo pueden venir de estos hosts (o de sus
   * subdominios). Si no, se aceptan URLs https de cualquier host.
   */
  allowedImageHosts?: readonly string[];
};

export type SanitizedCss = {
  css: string;
  removed: string[];
};

// Solo se admiten estos at-rules; todo lo demás (@import, @font-face, @charset...) se elimina.
const ALLOWED_AT_RULES = new Set(["media", "supports", "keyframes", "-webkit-keyframes"]);

const BLOCKED_PROPS = new Set(["behavior", "-ms-behavior", "-moz-binding"]);

// Funciones y esquemas que ejecutan código o cargan recursos por caminos que no controlamos.
const DANGEROUS_VALUE =
  /(?:expression|javascript|vbscript|image-set|-webkit-image-set|src|element|-moz-element|paint|cross-fade)\s*\(|(?:javascript|vbscript)\s*:/i;

const POSITION_ALLOWED = /^(?:static|relative|absolute)$/i;
const DATA_IMAGE = /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i;
const URL_FUNCTION = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s][^)]*?))\s*\)/gi;
const ROOT_TOKENS = /^(?:(?:html|body|:root)(?![\w-])\s*[>+~]?\s*)+/i;

/**
 * Decodifica los escapes de CSS (\72 = "r") y quita comentarios, para que no se pueda
 * esconder "url(" o "expression(" detrás de un escape. Solo se usa para revisar:
 * el CSS que se devuelve conserva su forma original.
 */
function normalize(value: string): string {
  return value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\\([0-9a-f]{1,6})[ \t\n\r\f]?/gi, (_match, hex: string) => {
      const codePoint = parseInt(hex, 16);
      return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : "\ufffd";
    })
    .replace(/\\([\s\S])/g, "$1")
    .replace(/\0/g, "");
}

function isAllowedUrl(raw: string, hosts?: readonly string[]): boolean {
  if (DATA_IMAGE.test(raw)) return true;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false; // relativas, "//host/..." y cualquier cosa que no sea una URL completa
  }
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  if (!hosts) return true;

  const host = url.hostname.toLowerCase();
  return hosts.some((allowed) => {
    const h = allowed.toLowerCase();
    return host === h || host.endsWith(`.${h}`);
  });
}

function urlProblem(value: string, hosts?: readonly string[]): string | null {
  const total = (value.match(/url\s*\(/gi) ?? []).length;
  if (total === 0) return null;

  const matches = [...value.matchAll(URL_FUNCTION)];
  if (matches.length !== total) return "url() con un formato no permitido";

  for (const match of matches) {
    const raw = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (!isAllowedUrl(raw, hosts)) return `URL no permitida (${raw.slice(0, 50)})`;
  }
  return null;
}

function declarationProblem(prop: string, value: string, hosts?: readonly string[]): string | null {
  if (BLOCKED_PROPS.has(prop)) return "propiedad no permitida";
  if (DANGEROUS_VALUE.test(value)) return "valor no permitido";
  if (prop === "position" && !POSITION_ALLOWED.test(value.trim())) {
    return "solo se permite static, relative o absolute";
  }
  if (prop === "z-index" && !/^(?:-?\d+|auto)$/i.test(value.trim())) {
    return "z-index tiene que ser un número entero";
  }
  return urlProblem(value, hosts);
}

function scopeSelector(selector: string, scope: string): string {
  const s = selector.trim();
  if (!s) return s;
  // html, body y :root no existen dentro del contenedor: se reemplazan por el propio scope.
  const rest = s.replace(ROOT_TOKENS, "").trim();
  return rest ? `${scope} ${rest}` : scope;
}

function ancestors(node: Node): Node[] {
  const result: Node[] = [];
  let parent = node.parent as Node | undefined;
  while (parent && parent.type !== "root") {
    result.push(parent);
    parent = parent.parent as Node | undefined;
  }
  return result;
}

const isInsideKeyframes = (node: Node) =>
  ancestors(node).some((a) => a.type === "atrule" && /keyframes$/i.test((a as AtRule).name));

// Las reglas anidadas (CSS nesting) son relativas a su padre: no se prefijan.
const isNested = (node: Node) => ancestors(node).some((a) => a.type === "rule");

/**
 * Limpia el CSS que escribe una persona para su perfil:
 * - elimina at-rules peligrosos (@import, @font-face, ...),
 * - prefija todos los selectores con `scope`,
 * - bloquea propiedades y valores que ejecutan código o cargan recursos no permitidos,
 * - solo deja URLs https (o imágenes data: raster) y, si se indica, de hosts permitidos,
 * - limita position y z-index, y neutraliza "</style>" para poder incrustarlo en una etiqueta <style>.
 */
export function sanitizeCss(input: string, options: SanitizeCssOptions = {}): SanitizedCss {
  const scope = options.scope ?? DEFAULT_SCOPE;
  if (!/^[.#][A-Za-z_][\w-]*$/.test(scope)) {
    throw new Error(`Scope inválido: ${scope}`);
  }

  const removed: string[] = [];
  const note = (message: string) => {
    if (!removed.includes(message)) removed.push(message);
  };

  if (input.length > MAX_CSS_CHARS) {
    return { css: "", removed: [`El CSS supera el límite de ${MAX_CSS_CHARS} caracteres.`] };
  }

  let root: Root;
  try {
    root = postcss.parse(input);
  } catch {
    return { css: "", removed: ["El CSS no es válido y no se pudo procesar."] };
  }

  root.walkComments((comment) => {
    comment.remove();
  });

  root.walkAtRules((atRule) => {
    if (!ALLOWED_AT_RULES.has(atRule.name.toLowerCase())) {
      note(`@${atRule.name} no está permitido.`);
      atRule.remove();
    }
  });

  root.each((node) => {
    if (node.type === "decl") {
      note("Había declaraciones sueltas fuera de una regla.");
      node.remove();
    }
  });

  root.walkRules((rule) => {
    if (isInsideKeyframes(rule) || isNested(rule)) return;
    rule.selectors = rule.selectors.map((selector) => scopeSelector(selector, scope));
  });

  root.walkDecls((decl) => {
    const prop = normalize(decl.prop).trim().toLowerCase();
    const value = normalize(decl.value);

    const problem = declarationProblem(prop, value, options.allowedImageHosts);
    if (problem) {
      note(`${decl.prop}: ${problem}.`);
      decl.remove();
      return;
    }

    if (prop === "z-index" && /^-?\d+$/.test(value.trim())) {
      const clamped = Math.max(-MAX_Z_INDEX, Math.min(MAX_Z_INDEX, parseInt(value, 10)));
      if (String(clamped) !== value.trim()) {
        decl.value = String(clamped);
        note(`z-index: se limitó a un valor entre -${MAX_Z_INDEX} y ${MAX_Z_INDEX}.`);
      }
    }
  });

  // "<" escapado como \3c para que "</style>" nunca pueda cerrar la etiqueta <style> que lo contenga.
  const css = root.toString().replace(/</g, "\\3c ").trim();
  return { css, removed };
}
