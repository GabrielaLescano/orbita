"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { isHandleTaken } from "@/data/get-profile";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation/auth";
import { signIn } from "@/auth";

export type RegisterState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function registerWithPassword(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    handle: formData.get("handle"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Revisá los campos marcados.", fieldErrors };
  }

  const { name, handle, email, password } = parsed.data;

  const existingEmail = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existingEmail) {
    return { ok: false, fieldErrors: { email: "Ya existe una cuenta con ese email." } };
  }

  if (await isHandleTaken(handle)) {
    return { ok: false, fieldErrors: { handle: "Ese handle ya está en uso." } };
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning({ id: users.id });

  await db.insert(profiles).values({
    userId: user.id,
    handle,
    tagline: "",
    status: "En línea",
    aboutHtml: "",
    customCss: "",
  });

  await signIn("credentials", { email, password, redirectTo: `/u/${handle}` });

  return { ok: true };
}
