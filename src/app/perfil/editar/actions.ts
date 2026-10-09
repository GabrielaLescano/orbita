"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { isHandleTaken } from "@/data/get-profile";
import { sanitizeCss, sanitizeHtml } from "@/lib/sanitize";
import { profileFormSchema } from "@/lib/validation/profile";

export type SaveProfileState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

/**
 * Guarda el perfil de la persona logueada.
 *
 * El HTML y el CSS se sanitizan ACÁ, una sola vez, antes de guardarlos.
 * La tabla "profile" solo debería contener contenido ya limpio (ver src/db/schema.ts);
 * ninguna otra parte del código vuelve a sanitizar al leer.
 */
export async function saveProfile(
  _prev: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/ingresar"); // nunca retorna: redirect() lanza internamente
  }
  const userId = session.user.id;

  const parsed = profileFormSchema.safeParse({
    handle: formData.get("handle"),
    tagline: formData.get("tagline"),
    status: formData.get("status") || "En línea",
    aboutHtml: formData.get("aboutHtml") ?? "",
    customCss: formData.get("customCss") ?? "",
    themeAccent1: formData.get("themeAccent1"),
    themeAccent2: formData.get("themeAccent2"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisá los campos marcados.", fieldErrors };
  }

  const data = parsed.data;

  const existing = await db.query.profiles.findFirst({ where: eq(profiles.userId, userId) });

  const handleTaken = await isHandleTaken(data.handle);
  if (handleTaken && existing?.handle.toLowerCase() !== data.handle) {
    return { ok: false, fieldErrors: { handle: "Ese handle ya está en uso." } };
  }

  const html = sanitizeHtml(data.aboutHtml);
  const { css } = sanitizeCss(data.customCss);

  const values = {
    handle: data.handle,
    tagline: data.tagline,
    status: data.status,
    aboutHtml: html,
    customCss: css,
    themeAccent1: data.themeAccent1,
    themeAccent2: data.themeAccent2,
  };

  if (existing) {
    await db.update(profiles).set(values).where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, ...values });
  }

  redirect(`/u/${data.handle}`); // nunca retorna: redirect() lanza internamente
  return { ok: true };
}
