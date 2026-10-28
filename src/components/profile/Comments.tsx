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

function Author({ c }: { c: Pick<ProfileComment, "author" | "handle"> }) {
  return <b>{c.handle ? <Link href={`/u/${c.handle}`}>{c.author}</Link> : c.author}</b>;
}

export function Comments({ profileId, initial, canComment }: Props) {
  const [items, setItems] = useState<ProfileComment[]>(initial);
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
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

  function toggleReply(commentId: string) {
    setError(null);
    setReplyText("");
    setReplyingTo((current) => (current === commentId ? null : commentId));
  }

  function publishReply(parentId: string) {
    if (!profileId) return;
    const body = replyText.trim();
    if (!body) return;

    startTransition(async () => {
      const result = await postComment(profileId, body, parentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setItems((prev) =>
        prev.map((c) => (c.id === parentId ? { ...c, replies: [...c.replies, result.comment] } : c)),
      );
      setReplyText("");
      setReplyingTo(null);
    });
  }

  const totalCount = items.reduce((n, c) => n + 1 + c.replies.length, 0);

  return (
    <div className="panel">
      <div className="in">
        <h2>
          Comentarios <small>{totalCount}</small>
        </h2>
        <ul className="comments">
          {items.map((c) => (
            <li key={c.id}>
              <div className="ava hex" style={{ "--h": c.hue } as CSSVars}>
                {c.initial}
              </div>
              <div>
                <div className="c-head">
                  <Author c={c} />
                  <time>{c.postedLabel}</time>
                </div>
                <p className="c-body">{c.body}</p>

                {canComment && profileId && (
                  <button type="button" className="c-reply-toggle" onClick={() => toggleReply(c.id)}>
                    {replyingTo === c.id ? "Cancelar" : "Responder"}
                  </button>
                )}

                {c.replies.length > 0 && (
                  <ul className="c-replies">
                    {c.replies.map((r) => (
                      <li key={r.id}>
                        <div className="ava hex" style={{ "--h": r.hue } as CSSVars}>
                          {r.initial}
                        </div>
                        <div>
                          <div className="c-head">
                            <Author c={r} />
                            <time>{r.postedLabel}</time>
                          </div>
                          <p className="c-body">{r.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {replyingTo === c.id && (
                  <div className="compose compose--reply">
                    <input
                      type="text"
                      value={replyText}
                      maxLength={140}
                      placeholder={`Responderle a ${c.author}`}
                      aria-label={`Responderle a ${c.author}`}
                      disabled={pending}
                      autoFocus
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") publishReply(c.id);
                      }}
                    />
                    <button type="button" className="btn" onClick={() => publishReply(c.id)} disabled={pending}>
                      {pending ? "Publicando…" : "Responder"}
                    </button>
                  </div>
                )}
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
