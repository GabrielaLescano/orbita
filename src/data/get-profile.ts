import type { Profile } from "@/types/profile";
import { demoProfile } from "./demo-profile";

/** Los handles válidos: letras, números, punto, guion y guion bajo. */
export const HANDLE_PATTERN = /^[a-z0-9_.-]{3,30}$/i;

// Hoy devuelve el perfil de ejemplo. Cuando exista la base de datos, solo cambia esta función.
export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  if (!HANDLE_PATTERN.test(handle)) return null;
  return handle.toLowerCase() === demoProfile.handle.toLowerCase() ? demoProfile : null;
}
