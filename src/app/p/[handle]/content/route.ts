import { getProfileByHandle } from "@/data/get-profile";
import { buildProfileCsp, buildProfileDocument } from "@/lib/profile-document";
import { sanitizeCss, sanitizeHtml } from "@/lib/sanitize";

// El sanitizado usa jsdom, que necesita el runtime de Node (no el Edge).
export const runtime = "nodejs";
// Cada respuesta lleva un nonce distinto, así que no se puede cachear como página estática.
export const dynamic = "force-dynamic";

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "SAMEORIGIN",
  "Cache-Control": "no-store",
};

/**
 * Devuelve el contenido personalizado del perfil como un documento HTML independiente.
 * La página lo muestra dentro de un <iframe sandbox>; esta ruta además lo protege con una CSP.
 * No usa el layout de la app: el HTML y el CSS de la persona no se mezclan con los nuestros.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);

  if (!profile) {
    return new Response("Perfil no encontrado", {
      status: 404,
      headers: { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Por ahora se sanitiza acá porque los datos de ejemplo no pasan por un "guardar".
  // Con la base de datos, esto se hace al guardar el perfil y acá solo se lee.
  const html = sanitizeHtml(profile.aboutHtml);
  const { css } = sanitizeCss(profile.customCss);

  const nonce = btoa(crypto.randomUUID());
  const body = buildProfileDocument({ html, css, theme: profile.theme, nonce });

  return new Response(body, {
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": buildProfileCsp(nonce),
    },
  });
}
