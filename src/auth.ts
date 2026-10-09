import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // El adapter necesita acceso directo a la base, así que este archivo solo se
  // importa desde rutas que corren en el runtime de Node (nunca desde el Edge).
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Sesiones en base de datos: al revocar una fila en "session" se cierra esa sesión.
  // (La alternativa, session: { strategy: "jwt" }, evita la consulta a la base en cada
  // request y es edge-safe, pero las sesiones no se pueden revocar desde el servidor.)
  session: { strategy: "database" },
});
