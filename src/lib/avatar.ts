import { del, put } from "@vercel/blob";

export const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type AvatarValidation = { ok: true } | { ok: false; error: string };

/** Chequeos antes de gastar un upload: tipo y tamaño. */
export function validateAvatarFile(file: File): AvatarValidation {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Tiene que ser una imagen: JPG, PNG, WEBP o GIF." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "La imagen pesa más de 4 MB." };
  }
  return { ok: true };
}

/**
 * Sube la foto a Vercel Blob y devuelve su URL pública. El nombre incluye el
 * id del perfil y un sufijo al azar (addRandomSuffix) para que una foto
 * nueva nunca pise, por caché del navegador, la URL de la anterior.
 */
export async function uploadAvatar(file: File, profileId: string): Promise<string> {
  const ext = file.type.split("/")[1] ?? "jpg";
  const blob = await put(`avatars/${profileId}.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

/**
 * Borra una foto vieja de Vercel Blob (al reemplazarla o quitarla). Es un
 * best-effort: si falla, no hace falta frenar el guardado del perfil por eso.
 */
export async function deleteAvatar(url: string): Promise<void> {
  try {
    await del(url);
  } catch (err) {
    console.error("[deleteAvatar] no se pudo borrar", url, err);
  }
}
