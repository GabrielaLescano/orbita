import { describe, expect, it } from "vitest";
import { buildProfileCsp, buildProfileDocument } from "./profile-document";

const NONCE = "dGVzdC1ub25jZS0xMjM0NTY3OA==";
const THEME = { accent1: "#ff3ddb", accent2: "#27d9f5" };
const count = (text: string, part: string) => text.split(part).length - 1;

describe("buildProfileCsp", () => {
  const csp = buildProfileCsp(NONCE);

  it("aísla el documento: sandbox sin scripts ni mismo origen", () => {
    expect(csp).toContain("sandbox");
    expect(csp).not.toContain("allow-scripts");
    expect(csp).not.toContain("allow-same-origin");
    expect(csp).not.toContain("allow-top-navigation");
  });

  it("bloquea todo lo que no se permite explícitamente", () => {
    expect(csp).toContain("default-src 'none'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("script-src");
  });

  it("solo acepta estilos con el nonce de la respuesta", () => {
    expect(csp).toContain(`style-src 'nonce-${NONCE}'`);
  });

  it("solo se puede incrustar desde el mismo sitio", () => {
    expect(csp).toContain("frame-ancestors 'self'");
  });

  it.each([["" ], ["corto"], ["con comillas\"; script-src *"], ["con espacio y;punto y coma 1234"]])(
    "rechaza un nonce inválido: %j",
    (nonce) => {
      expect(() => buildProfileCsp(nonce)).toThrow();
    },
  );
});

describe("buildProfileDocument", () => {
  it("pone el HTML dentro del contenedor .profile-content", () => {
    const doc = buildProfileDocument({ html: "<p>hola</p>", css: "", theme: THEME, nonce: NONCE });
    expect(doc).toContain('<main class="profile-content"><p>hola</p></main>');
  });

  it("marca los dos <style> con el nonce y no incluye ningún <script>", () => {
    const doc = buildProfileDocument({ html: "<p>hola</p>", css: "a{color:red}", theme: THEME, nonce: NONCE });
    expect(count(doc, `<style nonce="${NONCE}">`)).toBe(2);
    expect(doc).not.toMatch(/<script/i);
  });

  it("deja los colores del tema como variables CSS", () => {
    const doc = buildProfileDocument({ html: "", css: "", theme: { accent1: "#112233", accent2: "#aabbcc" }, nonce: NONCE });
    expect(doc).toContain("--accent-1: #112233");
    expect(doc).toContain("--accent-2: #aabbcc");
  });

  it("si el color del tema no es un hexadecimal, usa el de por defecto", () => {
    const doc = buildProfileDocument({
      html: "",
      css: "",
      theme: { accent1: "red;}</style><script>alert(1)</script>", accent2: "url(x)" },
      nonce: NONCE,
    });
    expect(doc).not.toMatch(/<script/i);
    expect(doc).toContain("--accent-1: #ff3ddb");
    expect(doc).toContain("--accent-2: #27d9f5");
  });

  it("un </style> dentro del CSS no puede cerrar la etiqueta", () => {
    const doc = buildProfileDocument({
      html: "",
      css: "a{}</style><script>alert(1)</script>",
      theme: THEME,
      nonce: NONCE,
    });
    expect(count(doc, "</style>")).toBe(2);
    expect(doc).not.toMatch(/<script/i);
  });

  it("rechaza un nonce inválido", () => {
    expect(() => buildProfileDocument({ html: "", css: "", theme: THEME, nonce: 'x"' })).toThrow();
  });
});
