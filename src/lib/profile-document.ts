import type { ThemeTokens } from "@/types/profile";

const DEFAULT_THEME: ThemeTokens = { accent1: "#ff3ddb", accent2: "#27d9f5" };
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const NONCE = /^[A-Za-z0-9+/=_-]{16,}$/;

function assertNonce(nonce: string): void {
  if (!NONCE.test(nonce)) throw new Error("Nonce inválido");
}

/**
 * CSP del documento del perfil:
 * - sandbox sin allow-scripts ni allow-same-origin: no ejecuta JavaScript y el contenido
 *   queda en un origen aislado, sin acceso a la sesión ni a la página que lo contiene;
 * - default-src 'none': todo lo que no se permite explícitamente queda bloqueado;
 * - los estilos solo aplican si traen el nonce de esta respuesta (los <style> y los style="..."
 *   que pasen sin él no se aplican);
 * - las imágenes solo pueden venir de https (o data: para las que ya vienen del CSS limpio).
 */
export function buildProfileCsp(nonce: string): string {
  assertNonce(nonce);
  return [
    "sandbox allow-popups allow-popups-to-escape-sandbox",
    "default-src 'none'",
    `style-src 'nonce-${nonce}'`,
    "img-src https: data:",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'self'",
  ].join("; ");
}

function baseCss(theme: ThemeTokens): string {
  return `
:root { color-scheme: dark; --accent-1: ${theme.accent1}; --accent-2: ${theme.accent2}; }
html, body { margin: 0; min-height: 100%; background: #0d0b1a; }
.profile-content {
  position: relative; isolation: isolate; overflow: hidden; box-sizing: border-box;
  padding: 20px; color: #ece9fb;
  font: 400 15px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  overflow-wrap: anywhere;
}
.profile-content img { max-width: 100%; height: auto; }
.profile-content table { max-width: 100%; border-collapse: collapse; }
.profile-content a { color: var(--accent-2); }
`;
}

type DocumentInput = {
  /** HTML ya pasado por sanitizeHtml. */
  html: string;
  /** CSS ya pasado por sanitizeCss (con scope ".profile-content"). */
  css: string;
  theme: ThemeTokens;
  nonce: string;
};

/**
 * Se arma el documento HTML completo que se muestra dentro del iframe.
 * Recibe HTML y CSS que ya fueron sanitizados: esta función no los limpia.
 */
export function buildProfileDocument({ html, css, theme, nonce }: DocumentInput): string {
  assertNonce(nonce);

  // Los colores del tema se validan: nunca se pega texto libre dentro del <style>.
  const safeTheme: ThemeTokens = {
    accent1: HEX_COLOR.test(theme.accent1) ? theme.accent1 : DEFAULT_THEME.accent1,
    accent2: HEX_COLOR.test(theme.accent2) ? theme.accent2 : DEFAULT_THEME.accent2,
  };
  // Segunda barrera: aunque llegue un "<" sin escapar, no puede cerrar la etiqueta <style>.
  const safeCss = css.replace(/</g, "\\3c ");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Perfil</title>
<style nonce="${nonce}">${baseCss(safeTheme)}</style>
<style nonce="${nonce}">${safeCss}</style>
</head>
<body>
<main class="profile-content">${html}</main>
</body>
</html>`;
}
