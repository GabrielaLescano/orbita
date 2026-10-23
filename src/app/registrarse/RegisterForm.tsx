"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { registerWithPassword, type RegisterState } from "./actions";

const initialState: RegisterState = { ok: false };

const HANDLE_RE = /^[a-z0-9_.-]{3,30}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function handleProblem(value: string): string | null {
  if (!value) return null;
  return HANDLE_RE.test(value) ? null : "De 3 a 30 caracteres: letras, números, punto, guion o guion bajo.";
}
function emailProblem(value: string): string | null {
  if (!value) return null;
  return EMAIL_RE.test(value) ? null : "Ingresá un email válido.";
}
function passwordProblem(value: string): string | null {
  if (!value) return null;
  if (value.length < 8) return "Mínimo 8 caracteres.";
  if (value.length > 72) return "Máximo 72 caracteres.";
  return null;
}
function confirmProblem(password: string, confirm: string): string | null {
  if (!confirm) return null;
  return password === confirm ? null : "Las contraseñas no coinciden.";
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerWithPassword, initialState);
  const errors = state.fieldErrors ?? {};

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleHint = handleProblem(handle);
  const emailHint = emailProblem(email);
  const passwordHint = passwordProblem(password);
  const confirmHint = confirmProblem(password, confirmPassword);

  const handleInvalid = Boolean(handleHint) || Boolean(errors.handle);
  const emailInvalid = Boolean(emailHint) || Boolean(errors.email);
  const passwordInvalid = Boolean(passwordHint) || Boolean(errors.password);
  const confirmInvalid = Boolean(confirmHint) || Boolean(errors.confirmPassword);

  const canSubmit =
    name.trim().length > 0 &&
    handle.length > 0 &&
    !handleInvalid &&
    email.length > 0 &&
    !emailInvalid &&
    password.length > 0 &&
    !passwordInvalid &&
    confirmPassword.length > 0 &&
    !confirmInvalid;

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
        <input
          id={nameId}
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nova"
          required
          maxLength={60}
        />
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
        <input
          id={emailId}
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vos@ejemplo.com"
          required
          aria-invalid={emailInvalid}
          aria-describedby={`${emailId}-hint`}
          className={emailInvalid ? "is-invalid" : undefined}
        />
        {(errors.email ?? emailHint) && (
          <small id={`${emailId}-hint`} className="form-field-error">
            {errors.email ?? emailHint}
          </small>
        )}
      </label>

      <label htmlFor={passwordId}>
        Contraseña
        <input
          id={passwordId}
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          maxLength={72}
          aria-invalid={passwordInvalid}
          aria-describedby={`${passwordId}-hint`}
          className={passwordInvalid ? "is-invalid" : undefined}
        />
        <small id={`${passwordId}-hint`} className={passwordInvalid ? "form-field-error" : undefined}>
          {errors.password ?? passwordHint ?? "Mínimo 8 caracteres."}
        </small>
      </label>

      <label htmlFor={confirmId}>
        Repetir contraseña
        <input
          id={confirmId}
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
          maxLength={72}
          aria-invalid={confirmInvalid}
          aria-describedby={`${confirmId}-hint`}
          className={confirmInvalid ? "is-invalid" : undefined}
        />
        {(errors.confirmPassword ?? confirmHint) && (
          <small id={`${confirmId}-hint`} className="form-field-error">
            {errors.confirmPassword ?? confirmHint}
          </small>
        )}
      </label>

      <button type="submit" className="btn btn--solid" disabled={pending || !canSubmit}>
        {pending ? "Creando tu perfil…" : "Crear cuenta y perfil"}
      </button>

      <p className="tagline" style={{ fontSize: 13 }}>
        ¿Ya tenés cuenta? <Link href="/ingresar">Iniciá sesión</Link>.
      </p>
    </form>
  );
}
