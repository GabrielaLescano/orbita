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
  if (!session?.user?.id) {
    console.error("[saveTheme] sin sesión");
    return { ok: false, error: "Iniciá sesión de nuevo." };
  }

  if (!HEX_COLOR.test(accent1) || !HEX_COLOR.test(accent2)) {
    console.error("[saveTheme] color inválido", { accent1, accent2 });
    return { ok: false, error: "Los colores tienen que ser hexadecimales, como #ff3ddb." };
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
    columns: { userId: true },
  });
  if (!profile) {
    console.error("[saveTheme] no existe ningún perfil con id", profileId);
    return { ok: false, error: "No podés editar ese perfil." };
  }
  if (profile.userId !== session.user.id) {
    console.error("[saveTheme] el perfil es de otro usuario", {
      profileUserId: profile.userId,
      sessionUserId: session.user.id,
    });
    return { ok: false, error: "No podés editar ese perfil." };
  }

  const [updated] = await db
    .update(profiles)
    .set({ themeAccent1: accent1, themeAccent2: accent2 })
    .where(eq(profiles.id, profileId))
    .returning({ id: profiles.id, themeAccent1: profiles.themeAccent1, themeAccent2: profiles.themeAccent2 });

  console.log("[saveTheme] UPDATE devolvió:", updated);
  if (!updated) {
    console.error("[saveTheme] el UPDATE no afectó ninguna fila (profileId no coincide con nada)");
    return { ok: false, error: "No se pudo guardar: el perfil no se encontró al actualizar." };
  }

  return { ok: true };
}
