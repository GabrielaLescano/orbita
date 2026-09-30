"use client";

import { useState } from "react";

export function FriendActions() {
  const [requested, setRequested] = useState(false);

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
