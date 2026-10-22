"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { sendFriendRequest } from "./friend-actions";
import type { FriendshipStatus } from "@/data/friends";

type Props = {
  targetUserId: string;
  initialStatus: FriendshipStatus;
  isLoggedIn: boolean;
};

const LABEL: Record<FriendshipStatus, string> = {
  none: "Agregar a amigos",
  pending: "Solicitud enviada",
  accepted: "Ya son amigos",
};

export function FriendActions({ targetUserId, initialStatus, isLoggedIn }: Props) {
  const [status, setStatus] = useState<FriendshipStatus>(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  function add() {
    if (status !== "none") return;
    setError(null);
    startTransition(async () => {
      const result = await sendFriendRequest(targetUserId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(result.status);
    });
  }

  return (
    <div className="actions">
      <button
        type="button"
        className="btn btn--solid"
        aria-pressed={status !== "none"}
        disabled={pending || status !== "none"}
        onClick={add}
      >
        {pending ? "Enviando…" : LABEL[status]}
      </button>
      <button type="button" className="btn" disabled title="Todavía no está implementado">
        Enviar mensaje
      </button>
      {error && (
        <small className="form-field-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
