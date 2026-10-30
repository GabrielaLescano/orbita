"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptFriendRequest, rejectFriendRequest } from "./friend-actions";
import type { PendingRequest } from "@/data/friends";

export function FriendRequests({ initial }: { initial: PendingRequest[] }) {
  const [items, setItems] = useState<PendingRequest[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function remove(requesterId: string) {
    setItems((prev) => prev.filter((r) => r.requesterId !== requesterId));
  }

  function accept(requesterId: string) {
    setBusyId(requesterId);
    setError(null);
    startTransition(async () => {
      const result = await acceptFriendRequest(requesterId);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      remove(requesterId);
      router.refresh();
    });
  }

  function reject(requesterId: string) {
    setBusyId(requesterId);
    setError(null);
    startTransition(async () => {
      const result = await rejectFriendRequest(requesterId);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      remove(requesterId);
      router.refresh();
    });
  }

  return (
    <div className="panel panel--neon">
      <div className="in">
        <h2>
          Solicitudes <small>{items.length}</small>
        </h2>
        {items.length === 0 && <p className="tagline">No tenés solicitudes pendientes.</p>}
        <ul className="requests">
          {items.map((r) => (
            <li key={r.requesterId}>
              <span className="requests-name">
                {r.handle ? <Link href={`/u/${r.handle}`}>{r.name}</Link> : r.name}
              </span>
              <span className="requests-actions">
                <button
                  type="button"
                  className="btn btn--solid"
                  disabled={busyId === r.requesterId}
                  onClick={() => accept(r.requesterId)}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={busyId === r.requesterId}
                  onClick={() => reject(r.requesterId)}
                >
                  Rechazar
                </button>
              </span>
            </li>
          ))}
        </ul>
        {error && (
          <p className="form-field-error" role="alert" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
