import bcrypt from "bcryptjs";

// bcryptjs es JavaScript puro (sin binarios nativos), así que no da problemas
// al desplegar en funciones serverless como las de Vercel. Evitamos repetir el
// tipo de dolor de cabeza que tuvimos con jsdom.
const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
