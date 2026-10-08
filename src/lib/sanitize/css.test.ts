import { describe, expect, it } from "vitest";
import { MAX_CSS_CHARS, sanitizeCss } from "./css";

const squash = (s: string) => s.replace(/\s+/g, " ").trim();
const SCOPE = ".profile-content";

describe("sanitizeCss: scoping de selectores", () => {
  it("prefija un selector simple", () => {
    expect(squash(sanitizeCss("a { color: red }").css)).toBe(`${SCOPE} a { color: red }`);
  });

  it("prefija cada selector de una lista", () => {
    const { css } = sanitizeCss("h1, .title { color: red }");
    expect(css).toContain(`${SCOPE} h1`);
    expect(css).toContain(`${SCOPE} .title`);
  });

  it("reemplaza body, html y :root por el scope", () => {
    expect(squash(sanitizeCss("body { background: black }").css)).toBe(`${SCOPE} { background: black }`);
    expect(squash(sanitizeCss(":root { --x: 1 }").css)).toBe(`${SCOPE} { --x: 1 }`);
    expect(squash(sanitizeCss("html body p { margin: 0 }").css)).toBe(`${SCOPE} p { margin: 0 }`);
  });

  it("también prefija el selector universal", () => {
    expect(squash(sanitizeCss("* { margin: 0 }").css)).toBe(`${SCOPE} * { margin: 0 }`);
  });

  it("prefija las reglas dentro de @media y @supports", () => {
    const { css } = sanitizeCss("@media (max-width: 600px) { a { color: red } }");
    expect(css).toContain(`${SCOPE} a`);
  });

  it("no toca los pasos de @keyframes", () => {
    const { css } = sanitizeCss("@keyframes spin { from { opacity: 0 } to { opacity: 1 } }");
    expect(css).toContain("from");
    expect(css).not.toContain(`${SCOPE} from`);
    expect(css).not.toContain(`${SCOPE} to`);
  });

  it("no prefija de nuevo las reglas anidadas", () => {
    const { css } = sanitizeCss(".a { color: red; .b { color: blue } }");
    expect(css).toContain(`${SCOPE} .a`);
    expect(css).not.toContain(`${SCOPE} .b`);
  });

  it("acepta un scope propio", () => {
    expect(squash(sanitizeCss("a { color: red }", { scope: "#perfil-42" }).css)).toBe("#perfil-42 a { color: red }");
  });

  it.each([["a, b"], ["body"], ["</style>"], [""], [".a .b"]])("rechaza el scope inválido %j", (scope) => {
    expect(() => sanitizeCss("a{color:red}", { scope })).toThrow();
  });

  it("conserva las variables CSS y su uso", () => {
    const { css } = sanitizeCss(":root { --accent-1: #ff3ddb } a { color: var(--accent-1) }");
    expect(css).toContain("--accent-1: #ff3ddb");
    expect(css).toContain("var(--accent-1)");
  });
});

describe("sanitizeCss: at-rules", () => {
  it("elimina @import y avisa", () => {
    const { css, removed } = sanitizeCss('@import url("https://evil.example/x.css"); a { color: red }');
    expect(css).not.toContain("@import");
    expect(css).toContain(`${SCOPE} a`);
    expect(removed.some((m) => m.includes("@import"))).toBe(true);
  });

  it.each([
    ["@font-face", '@font-face { font-family: x; src: url("https://evil.example/f.woff2") }'],
    ["@charset", '@charset "utf-8"; a { color: red }'],
    ["@namespace", "@namespace svg url(http://www.w3.org/2000/svg); a { color: red }"],
    ["@property", "@property --x { syntax: '<length>'; inherits: false; initial-value: 0px }"],
    ["@container", "@container (min-width: 1px) { a { color: red } }"],
  ])("elimina %s", (nombre, source) => {
    const { css } = sanitizeCss(source);
    expect(css).not.toContain(nombre);
  });
});

describe("sanitizeCss: URLs", () => {
  it.each([
    ["javascript:", "a { background: url(javascript:alert(1)) }"],
    ["javascript: entre comillas", 'a { background: url("javascript:alert(1)") }'],
    ["http", "a { background: url(http://example.com/a.png) }"],
    ["sin esquema (//)", "a { background: url(//example.com/a.png) }"],
    ["relativa", "a { background: url(/local.png) }"],
    ["data:text/html", "a { background: url(data:text/html;base64,PHNjcmlwdD4=) }"],
    ["data:image/svg", "a { background: url(data:image/svg+xml;base64,AAAA) }"],
    ["credenciales en la URL", "a { background: url(https://user:pass@example.com/a.png) }"],
    ["url con escape (u\\72l)", "a { background: u\\72l(javascript:alert(1)) }"],
    ["url con escape (\\75rl) y http", "a { background: \\75rl(http://example.com/a.png) }"],
  ])("elimina la declaración con URL no permitida: %s", (_caso, source) => {
    const { css, removed } = sanitizeCss(source);
    expect(css).not.toMatch(/background/i);
    expect(removed.length).toBeGreaterThan(0);
  });

  it("conserva URLs https y data:image raster", () => {
    expect(sanitizeCss('a { background: url("https://img.example.com/a.png") }').css).toContain("background");
    expect(sanitizeCss("a { background: url(data:image/png;base64,iVBORw0KGgo=) }").css).toContain("background");
  });

  it("con lista de hosts, acepta el host y sus subdominios", () => {
    const options = { allowedImageHosts: ["cdn.example.com"] };
    expect(sanitizeCss("a { background: url(https://cdn.example.com/a.png) }", options).css).toContain("background");
    expect(sanitizeCss("a { background: url(https://img.cdn.example.com/a.png) }", options).css).toContain("background");
  });

  it.each([
    ["otro dominio", "https://example.com/a.png"],
    ["host como prefijo de otro dominio", "https://cdn.example.com.evil.net/a.png"],
    ["sufijo sin punto", "https://evilcdn.example.com/a.png"],
  ])("con lista de hosts, rechaza %s", (_caso, url) => {
    const { css } = sanitizeCss(`a { background: url(${url}) }`, { allowedImageHosts: ["cdn.example.com"] });
    expect(css).not.toMatch(/background/i);
  });
});

describe("sanitizeCss: propiedades y valores peligrosos", () => {
  it.each([
    ["expression()", "a { width: expression(alert(1)) }"],
    ["expression() con escape", "a { width: \\65xpression(alert(1)) }"],
    ["behavior", "a { behavior: url(x.htc) }"],
    ["behavior con escape", "a { b\\65havior: url(x.htc) }"],
    ["-moz-binding", "a { -moz-binding: url(https://example.com/x.xml#y) }"],
    ["image-set()", 'a { background: image-set("https://example.com/a.png" 1x) }'],
    ["-webkit-image-set()", 'a { background: -webkit-image-set("https://example.com/a.png" 1x) }'],
    ["javascript: fuera de url()", "a { content: javascript:alert(1) }"],
  ])("elimina %s", (_caso, source) => {
    const { css, removed } = sanitizeCss(source);
    expect(css).not.toContain(":");
    expect(removed.length).toBeGreaterThan(0);
  });

  it.each([["fixed"], ["sticky"], ["var(--p)"], ["FIXED"]])("elimina position: %s", (valor) => {
    expect(sanitizeCss(`a { position: ${valor} }`).css).not.toMatch(/position/i);
  });

  it("conserva position static, relative y absolute", () => {
    expect(sanitizeCss("a { position: absolute }").css).toContain("position: absolute");
    expect(sanitizeCss("a { position: relative }").css).toContain("position: relative");
  });

  it("limita z-index", () => {
    expect(sanitizeCss("a { z-index: 99999 }").css).toContain("z-index: 10");
    expect(sanitizeCss("a { z-index: -500 }").css).toContain("z-index: -10");
    expect(sanitizeCss("a { z-index: 3 }").css).toContain("z-index: 3");
    expect(sanitizeCss("a { z-index: auto }").css).toContain("z-index: auto");
  });

  it("elimina un z-index que no es un número entero", () => {
    expect(sanitizeCss("a { z-index: calc(1 + 1) }").css).not.toMatch(/z-index/);
    expect(sanitizeCss("a { z-index: var(--z) }").css).not.toMatch(/z-index/);
  });
});

describe("sanitizeCss: incrustado en <style>", () => {
  it("nunca devuelve un </style> que pueda cerrar la etiqueta", () => {
    const { css } = sanitizeCss('a::after { content: "</style><script>alert(1)</script>" }');
    expect(css).not.toContain("<");
    expect(css).not.toMatch(/<\/style/i);
    expect(css).toContain("\\3c ");
  });

  it("elimina los comentarios", () => {
    const { css } = sanitizeCss("/* hola </style> */ a { color: red }");
    expect(css).not.toContain("hola");
    expect(css).not.toContain("<");
  });
});

describe("sanitizeCss: casos límite", () => {
  it("devuelve vacío y avisa si el CSS no se puede interpretar", () => {
    const result = sanitizeCss("a { color: red");
    expect(result.css).toBe("");
    expect(result.removed).toHaveLength(1);
  });

  it("devuelve vacío si supera el máximo", () => {
    const result = sanitizeCss("a{color:red}".repeat(Math.ceil(MAX_CSS_CHARS / 10)));
    expect(result.css).toBe("");
    expect(result.removed).toHaveLength(1);
  });

  it("elimina las declaraciones sueltas fuera de una regla", () => {
    expect(squash(sanitizeCss("color: red; a { color: blue }").css)).toBe(`${SCOPE} a { color: blue }`);
  });

  it("acepta una entrada vacía", () => {
    expect(sanitizeCss("")).toEqual({ css: "", removed: [] });
  });
});
