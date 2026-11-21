import type { ThemeTokens } from "@/types/profile";

const DEFAULT_THEME: ThemeTokens = { accent1: "#ff3ddb", accent2: "#27d9f5" };
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const NONCE = /^[A-Za-z0-9+/=_-]{16,}$/;

function assertNonce(nonce: string): void {
  if (!NONCE.test(nonce)) throw new Error("Nonce inválido");
}

function skeletonCss(theme: ThemeTokens): string {
  return `
:root { color-scheme: dark; --accent-1: ${theme.accent1}; --accent-2: ${theme.accent2}; }
html, body { margin: 0; min-height: 100%; }
body {
  background: #06050d; color: #ece9fb;
  font: 400 14px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  padding: 16px;
}
.profile-root { display: flex; flex-direction: column; gap: 16px; }
.panel { background: #0d0b1a; border: 1px solid #2a2447; padding: 16px; }
.panel h2 { font-size: 14px; margin: 0 0 10px; }
.name { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
.tagline { color: #a29cc4; margin: 0 0 10px; font-size: 13px; }
.stats { display: flex; gap: 20px; font-size: 12px; color: #a29cc4; }
.stats b { display: block; color: #ece9fb; font-size: 15px; }
.profile-content { overflow-wrap: anywhere; }
.profile-content img { max-width: 100%; height: auto; }
.profile-content a { color: var(--accent-2); }
.friends { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin: 0; }
.friends li { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 11px; width: 56px; }
.friends .hex {
  width: 44px; height: 48px; display: grid; place-items: center; font-weight: 700; color: #0a0614;
  background: linear-gradient(135deg, hsl(var(--h) 90% 62%), hsl(calc(var(--h) + 60) 85% 48%));
  clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
}
.comments { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.comments li { display: flex; gap: 8px; }
.comments .ava {
  flex: none; width: 30px; height: 33px; display: grid; place-items: center; font-weight: 700; color: #0a0614; font-size: 12px;
  background: linear-gradient(135deg, hsl(var(--h) 90% 62%), hsl(calc(var(--h) + 60) 85% 48%));
  clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
}
.comments b { font-size: 13px; }
.comments p { margin: 2px 0 0; font-size: 13px; color: #d8d3f0; }
`;
}

const SAMPLE_FRIENDS = [
  { h: 190, i: "K" },
  { h: 120, i: "V" },
  { h: 45, i: "L" },
  { h: 330, i: "T" },
];

const SAMPLE_COMMENTS = [
  { h: 190, i: "K", name: "kiro", body: "¡Me encanta como te quedó!" },
  { h: 45, i: "L", name: "lumi", body: "Buenísimo el estilo nuevo." },
];

type PreviewInput = {
  html: string;
  css: string;
  cssProfile: string;
  theme: ThemeTokens;
  nonce: string;
};

export function buildProfilePreviewDocument({ html, css, cssProfile, theme, nonce }: PreviewInput): string {
  assertNonce(nonce);

  const safeTheme: ThemeTokens = {
    accent1: HEX_COLOR.test(theme.accent1) ? theme.accent1 : DEFAULT_THEME.accent1,
    accent2: HEX_COLOR.test(theme.accent2) ? theme.accent2 : DEFAULT_THEME.accent2,
  };
  const safeCss = css.replace(/</g, "\\3c ");
  const safeCssProfile = cssProfile.replace(/</g, "\\3c ");

  const friends = SAMPLE_FRIENDS.map(
    (f) => `<li><span class="hex" style="--h:${f.h}">${f.i}</span>amigo</li>`,
  ).join("");

  const comments = SAMPLE_COMMENTS.map(
    (c) =>
      `<li><span class="ava" style="--h:${c.h}">${c.i}</span><div><b>${c.name}</b><p>${c.body}</p></div></li>`,
  ).join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>Vista previa</title>
<style nonce="${nonce}">${skeletonCss(safeTheme)}</style>
<style nonce="${nonce}">${safeCssProfile}</style>
<style nonce="${nonce}">${safeCss}</style>
</head>
<body>
<div class="profile-root">
  <div class="panel">
    <p class="name">tu_handle</p>
    <p class="tagline">Tu frase corta va acá</p>
    <div class="stats"><span><b>0</b>visitas</span><span><b>0</b>amigos</span></div>
  </div>
  <div class="panel">
    <h2>Sobre mí</h2>
    <main class="profile-content">${html}</main>
  </div>
  <div class="panel">
    <h2>Top 8 (de ejemplo)</h2>
    <ul class="friends">${friends}</ul>
  </div>
  <div class="panel">
    <h2>Comentarios (de ejemplo)</h2>
    <ul class="comments">${comments}</ul>
  </div>
</div>
</body>
</html>`;
}
