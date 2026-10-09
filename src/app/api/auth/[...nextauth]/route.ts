import { handlers } from "@/auth";

// Next.js corre los Route Handlers en Node por defecto: acá es seguro
// importar src/auth.ts completo (con el adapter de la base de datos).
export const { GET, POST } = handlers;
