"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { HEX_COLOR } from "@/lib/validation/profile";

export type SaveThemeResult = { ok: true } | { ok: false; error: string };

/**
 * Guarda el tema elegido en el panel "Personalizar" del propio perfil.
 * El panel solo se muestra al dueño (ver TopBar.tsx), pero igual se vuelve a
 * verificar acá que profileId sea realmente suyo antes de escribir nada.
 */
export async function saveTheme(
  profileId: string,
  accent1: string,
  accent2: string,
): Promise<SaveThemeResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Iniciá sesión de nuevo." };

  if (!HEX_COLOR.test(accent1) || !HEX_COLOR.test(accent2)) {
    return { ok: false, error: "Los colores tienen que ser hexadecimales, como #ff3ddb." };
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
    columns: { userId: true },
  });
  if (!profile || profile.userId !== session.user.id) {
    return { ok: false, error: "No podés editar ese perfil." };
  }

  await db
    .update(profiles)
    .set({ themeAccent1: accent1, themeAccent2: accent2 })
    .where(eq(profiles.id, profileId));

  return { ok: true };
}
