import DOMPurify from "isomorphic-dompurify";

export const MAX_HTML_CHARS = 20_000;

// Lista cerrada de etiquetas: solo texto, estructura básica, enlaces, imágenes y tablas.
// No hay form, input, iframe, svg, style, script ni nada que ejecute o capture datos.
const ALLOWED_TAGS = [
  "a", "abbr", "b", "blockquote", "br", "center", "code", "div", "em",
  "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "img", "li", "marquee",
  "ol", "p", "pre", "s", "small", "span", "strong", "sub", "sup",
  "table", "tbody", "td", "tfoot", "th", "thead", "tr", "u", "ul",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "width", "height", "colspan", "rowspan", "align"];

const CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  // Estos atributos no son URLs, pero DOMPurify los revisaría contra ALLOWED_URI_REGEXP.
  ADD_URI_SAFE_ATTR: ["width", "height", "colspan", "rowspan", "align"],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  // Solo enlaces http(s) y mailto. Las URLs relativas y "//host" quedan fuera.
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
  KEEP_CONTENT: true,
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
};

const HTTPS = /^https:\/\//i;

function hardenNode(node: Node): void {
  const element = node as Element;
  const tag = element.tagName?.toLowerCase();

  if (tag === "a") {
    const href = element.getAttribute("href")?.trim();
    if (href && /^https?:/i.test(href)) {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer nofollow ugc");
    }
  } else if (tag === "img") {
    // Solo imágenes https (nada de http, relativas ni data:).
    const src = element.getAttribute("src")?.trim() ?? "";
    if (!HTTPS.test(src)) element.removeAttribute("src");
    element.setAttribute("loading", "lazy");
    element.setAttribute("decoding", "async");
    element.setAttribute("referrerpolicy", "no-referrer");
  }
}

/**
 * Limpia el HTML que escribe una persona para su perfil ("Sobre mí").
 * Devuelve HTML seguro, con una lista cerrada de etiquetas y atributos.
 *
 * Es una capa de defensa: el contenido igual se tiene que mostrar dentro de un iframe
 * con sandbox y una CSP estricta.
 */
export function sanitizeHtml(input: string): string {
  const dirty = input.slice(0, MAX_HTML_CHARS);

  DOMPurify.addHook("afterSanitizeAttributes", hardenNode);
  try {
    return DOMPurify.sanitize(dirty, CONFIG) as string;
  } finally {
    DOMPurify.removeHook("afterSanitizeAttributes");
  }
}
