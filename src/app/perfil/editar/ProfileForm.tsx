"use client";

import { useActionState, useId, useState, type ChangeEvent } from "react";
import { MAX_CSS_CHARS, MAX_HTML_CHARS } from "@/lib/sanitize";
import type { Profile } from "@/types/profile";
import { saveProfile, type SaveProfileState } from "./actions";

type ProfileFormData = Pick<
  Profile,
  "handle" | "tagline" | "status" | "aboutHtml" | "customCss" | "theme" | "avatarUrl"
>;

type Props = { initial: ProfileFormData | null };

const EMPTY: ProfileFormData = {
  handle: "",
  tagline: "",
  status: "En línea",
  aboutHtml: "",
  customCss: "",
  theme: { accent1: "#ff3ddb", accent2: "#27d9f5" },
  avatarUrl: null,
};

const initialState: SaveProfileState = { ok: false };

// Mismo patrón que valida el servidor (src/lib/validation/profile.ts): esto es
// solo para avisar antes de enviar. La verdad siempre la decide el servidor.
const HANDLE_RE = /^[a-z0-9_.-]{3,30}$/i;

function handleProblem(value: string): string | null {
  if (!value) return null; // "required" del input ya avisa si está vacío
  return HANDLE_RE.test(value) ? null : "De 3 a 30 caracteres: letras, números, punto, guion o guion bajo.";
}

export function ProfileForm({ initial }: Props) {
  const data = initial ?? EMPTY;
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const errors = state.fieldErrors ?? {};

  const [handle, setHandle] = useState(data.handle);
  const [aboutHtml, setAboutHtml] = useState(data.aboutHtml);
  const [customCss, setCustomCss] = useState(data.customCss);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(data.avatarUrl);
  const [avatarFileSelected, setAvatarFileSelected] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  function onAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarFileSelected(false);
      setAvatarPreview(removeAvatar ? null : data.avatarUrl);
      return;
    }
    setRemoveAvatar(false);
    setAvatarFileSelected(true);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onRemoveAvatarChange(checked: boolean) {
    setRemoveAvatar(checked);
    setAvatarFileSelected(false);
    setAvatarPreview(checked ? null : data.avatarUrl);
  }

  const avatarId = useId();
  const handleId = useId();
  const taglineId = useId();
  const handleHint = handleProblem(handle);
  const handleInvalid = Boolean(handleHint) || Boolean(errors.handle);

  return (
    <form action={formAction} className="profile-form" noValidate>
      {state.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}

      <label htmlFor={avatarId}>
        Foto de perfil
        <div className="avatar-field">
          {avatarPreview && (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa de un File local o una URL de Vercel Blob
            <img src={avatarPreview} alt="" className="avatar-preview" />
          )}
          <input
            id={avatarId}
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={onAvatarChange}
          />
        </div>
        <small>JPG, PNG, WEBP o GIF. Hasta 4&nbsp;MB.</small>
        {errors.avatar && <small className="form-field-error">{errors.avatar}</small>}
        {data.avatarUrl && !avatarFileSelected && (
          <label className="avatar-remove-row">
            <input
              type="checkbox"
              name="removeAvatar"
              checked={removeAvatar}
              onChange={(e) => onRemoveAvatarChange(e.target.checked)}
            />
            Quitar la foto actual
          </label>
        )}
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
          {errors.handle ?? handleHint ?? "Así te van a encontrar: /u/tu-handle."}
        </small>
      </label>

      <label htmlFor={taglineId}>
        Frase corta
        <input
          id={taglineId}
          name="tagline"
          defaultValue={data.tagline}
          maxLength={140}
          placeholder="Una línea sobre vos"
        />
        {errors.tagline && <small className="form-field-error">{errors.tagline}</small>}
      </label>

      <label>
        Estado
        <input name="status" defaultValue={data.status} maxLength={60} placeholder="En línea" />
      </label>

      <div className="form-row">
        <label>
          Color principal
          <input type="color" name="themeAccent1" defaultValue={data.theme.accent1} required />
        </label>
        <label>
          Color secundario
          <input type="color" name="themeAccent2" defaultValue={data.theme.accent2} required />
        </label>
      </div>

      <label>
        <span className="label-row">
          Sobre mí (HTML)
          <CharCount value={aboutHtml} max={MAX_HTML_CHARS} />
        </span>
        <textarea
          name="aboutHtml"
          value={aboutHtml}
          onChange={(e) => setAboutHtml(e.target.value)}
          maxLength={MAX_HTML_CHARS}
          rows={8}
          placeholder="<p>Hola, soy...</p>"
          aria-invalid={Boolean(errors.aboutHtml)}
        />
        <small>Se limpia automáticamente al guardar: nada de scripts ni estilos en línea.</small>
        {errors.aboutHtml && <small className="form-field-error">{errors.aboutHtml}</small>}
      </label>

      <label>
        <span className="label-row">
          Estilo propio (CSS)
          <CharCount value={customCss} max={MAX_CSS_CHARS} />
        </span>
        <textarea
          name="customCss"
          value={customCss}
          onChange={(e) => setCustomCss(e.target.value)}
          maxLength={MAX_CSS_CHARS}
          rows={8}
          placeholder="a { color: var(--accent-1); }"
          aria-invalid={Boolean(errors.customCss)}
        />
        <small>No hace falta repetir el selector del contenedor: se agrega solo.</small>
        {errors.customCss && <small className="form-field-error">{errors.customCss}</small>}
      </label>

      <button type="submit" className="btn btn--solid" disabled={pending || handleInvalid}>
        {pending ? "Guardando…" : "Guardar perfil"}
      </button>
    </form>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const near = value.length > max * 0.9;
  return (
    <span className={`char-count${near ? " char-count--near" : ""}`}>
      {value.length.toLocaleString("es-AR")} / {max.toLocaleString("es-AR")}
    </span>
  );
}
