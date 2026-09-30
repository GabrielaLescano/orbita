"use client";

import { useState } from "react";
import type { CSSVars } from "@/types/css";
import type { ProfileComment } from "@/types/profile";

export function Comments({ initial }: { initial: ProfileComment[] }) {
  const [items, setItems] = useState<ProfileComment[]>(initial);
  const [text, setText] = useState("");

  function publish() {
    const body = text.trim();
    if (!body) return;
    // React escapa el texto al renderizarlo, así que body nunca se interpreta como HTML.
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        author: "vos",
        initial: "V",
        hue: 280,
        body,
        postedLabel: "ahora",
      },
      ...prev,
    ]);
    setText("");
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
                  <b>{c.author}</b>
                  <time>{c.postedLabel}</time>
                </div>
                <p className="c-body">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="compose">
          <input
            type="text"
            value={text}
            maxLength={140}
            placeholder="Escribí un comentario"
            aria-label="Escribí un comentario"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") publish();
            }}
          />
          <button type="button" className="btn" onClick={publish}>
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}
