"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { registerWithPassword, type RegisterState } from "./actions";

const initialState: RegisterState = { ok: false };

const HANDLE_RE = /^[a-z0-9_.-]{3,30}$/i;

function handleProblem(value: string): string | null {
  if (!value) return null; // "required" del input ya avisa si está vacío
  return HANDLE_RE.test(value) ? null : "De 3 a 30 caracteres: letras, números, punto, guion o guion bajo.";
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerWithPassword, initialState);
  const errors = state.fieldErrors ?? {};

  const [handle, setHandle] = useState("");
  const handleHint = handleProblem(handle);
  const handleInvalid = Boolean(handleHint) || Boolean(errors.handle);

  const nameId = useId();
  const handleId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();

  return (
    <form action={formAction} className="profile-form" noValidate>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <label htmlFor={nameId}>
        Nombre
        <input id={nameId} name="name" placeholder="Nova" required maxLength={60} />
        {errors.name && <small className="form-field-error">{errors.name}</small>}
      </label>

      <label htmlFor={handleId}>
        Handle
        <input
          id={handleId}
          name="handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="nova_kid"
          required
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9_.-]{3,30}"
          aria-invalid={handleInvalid}
          aria-describedby={`${handleId}-hint`}
          className={handleInvalid ? "is-invalid" : undefined}
        />
        <small id={`${handleId}-hint`} className={handleInvalid ? "form-field-error" : undefined}>
          {errors.handle ?? handleHint ?? "Así va a quedar tu perfil: /u/tu-handle. Lo podés cambiar después."}
        </small>
      </label>

      <label htmlFor={emailId}>
        Email
        <input id={emailId} name="email" type="email" placeholder="vos@ejemplo.com" required />
        {errors.email && <small className="form-field-error">{errors.email}</small>}
      </label>

      <label htmlFor={passwordId}>
        Contraseña
        <input id={passwordId} name="password" type="password" required minLength={8} maxLength={72} />
        <small>Mínimo 8 caracteres.</small>
        {errors.password && <small className="form-field-error">{errors.password}</small>}
      </label>

      <label htmlFor={confirmId}>
        Repetir contraseña
        <input id={confirmId} name="confirmPassword" type="password" required minLength={8} maxLength={72} />
        {errors.confirmPassword && <small className="form-field-error">{errors.confirmPassword}</small>}
      </label>

      <button type="submit" className="btn btn--solid" disabled={pending || handleInvalid}>
        {pending ? "Creando tu perfil…" : "Crear cuenta y perfil"}
      </button>

      <p className="tagline" style={{ fontSize: 13 }}>
        ¿Ya tenés cuenta? <Link href="/ingresar">Iniciá sesión</Link>.
      </p>
    </form>
  );
}
