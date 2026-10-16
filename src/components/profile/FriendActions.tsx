"use client";

import Link from "next/link";
import { useState } from "react";

export function FriendActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [requested, setRequested] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="actions">
        <Link href="/ingresar" className="btn btn--solid">
          Agregar a amigos
        </Link>
        <Link href="/ingresar" className="btn">
          Enviar mensaje
        </Link>
      </div>
    );
  }

  return (
    <div className="actions">
      <button
        type="button"
        className="btn btn--solid"
        aria-pressed={requested}
        onClick={() => setRequested((r) => !r)}
      >
        {requested ? "Solicitud enviada" : "Agregar a amigos"}
      </button>
      <button type="button" className="btn">
        Enviar mensaje
      </button>
    </div>
  );
}
