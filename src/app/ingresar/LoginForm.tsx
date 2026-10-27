"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { loginWithPassword, type LoginState } from "./actions";
import { PasswordInput } from "@/components/register/PasswordInput";

const initialState: LoginState = { ok: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginWithPassword, initialState);
  const errors = state.fieldErrors ?? {};
  const emailId = useId();
  const passwordId = useId();

  return (
    <form action={formAction} className="profile-form" noValidate>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <label htmlFor={emailId}>
        Email
        <input id={emailId} name="email" type="email" placeholder="vos@ejemplo.com" required />
        {errors.email && <small className="form-field-error">{errors.email}</small>}
      </label>

      <label htmlFor={passwordId}>
        Contraseña
        <PasswordInput id={passwordId} name="password" required />
        {errors.password && <small className="form-field-error">{errors.password}</small>}
      </label>

      <button type="submit" className="btn btn--solid" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <p className="tagline" style={{ fontSize: 13 }}>
        ¿No tenés cuenta? <Link href="/registrarse">Creá una</Link>.
      </p>
    </form>
  );
}
