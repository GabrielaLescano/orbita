import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Config sin adapter ni acceso a la base de datos: puede correr en el Edge
 * (por ejemplo, desde middleware.ts). La config completa está en src/auth.ts.
 * El proveedor de Credentials (login con email y contraseña) NO va acá: su
 * función authorize() necesita consultar la base, así que vive solo en auth.ts.
 * https://authjs.dev/guides/edge-compatibility
 */
export const authConfig = {
  providers: [GitHub],
  pages: {
    signIn: "/ingresar",
  },
  callbacks: {
    // Acá se resolvería si una ruta requiere sesión, cuando agreguemos
    // middleware.ts para proteger /perfil/editar.
    authorized: ({ auth }) => Boolean(auth?.user),
  },
} satisfies NextAuthConfig;
