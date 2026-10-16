"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validation/auth";

export type LoginState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export async function loginWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
    return { ok: true };
  } catch (err) {
    // redirect() (si el login funcionó) también lanza por dentro: hay que
    // dejarlo pasar y no tratarlo como un error de login.
    if (err instanceof AuthError && err.type === "CredentialsSignin") {
      return { ok: false, error: "Email o contraseña incorrectos." };
    }
    throw err;
  }
}
