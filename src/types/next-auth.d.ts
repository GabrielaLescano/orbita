import type { DefaultSession } from "next-auth";

// Avisa a TypeScript que session.user.id existe: lo agrega el callback
// "session" en src/auth.ts (Auth.js no lo incluye por defecto).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
