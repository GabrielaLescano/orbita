"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { postComment } from "./comment-actions";
import type { CSSVars } from "@/types/css";
import type { ProfileComment } from "@/types/profile";

type Props = {
  profileId: string | null;
  initial: ProfileComment[];
  canComment: boolean;
};

export function Comments({ profileId, initial, canComment }: Props) {
  const [items, setItems] = useState<ProfileComment[]>(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function publish() {
    if (!profileId) return;
    const body = text.trim();
    if (!body) return;

    startTransition(async () => {
      const result = await postComment(profileId, body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setItems((prev) => [result.comment, ...prev]);
      setText("");
    });
  }

  return (
    <div className="panel">
      <div className="in">
        <h2>
          Comentarios <small>{items.length}</small>
        </h2>
        <ul className="comments">
          {items.map((c) => (
            <li key={c.id}>
              <div className="ava hex" style={{ "--h": c.hue } as CSSVars}>
                {c.initial}
              </div>
              <div>
                <div className="c-head">
                  <b>{c.handle ? <Link href={`/u/${c.handle}`}>{c.author}</Link> : c.author}</b>
                  <time>{c.postedLabel}</time>
                </div>
                <p className="c-body">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>

        {profileId === null ? (
          <p className="note" style={{ marginTop: 18 }}>
            Este es un perfil de ejemplo: no se pueden dejar comentarios acá.
          </p>
        ) : canComment ? (
          <div className="compose">
            <input
              type="text"
              value={text}
              maxLength={140}
              placeholder="Escribí un comentario"
              aria-label="Escribí un comentario"
              disabled={pending}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") publish();
              }}
            />
            <button type="button" className="btn" onClick={publish} disabled={pending}>
              {pending ? "Publicando…" : "Publicar"}
            </button>
          </div>
        ) : (
          <p className="note" style={{ marginTop: 18 }}>
            <Link href="/ingresar">Iniciá sesión</Link> para dejar un comentario.
          </p>
        )}
        {error && (
          <p className="form-field-error" role="alert" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
