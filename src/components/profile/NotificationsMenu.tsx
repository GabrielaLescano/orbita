"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { acceptFriendRequest, rejectFriendRequest } from "./friend-actions";
import type { NotificationItem } from "@/data/notifications";

export function NotificationsMenu({ initial }: { initial: NotificationItem[] }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function respond(item: Extract<NotificationItem, { kind: "friend" }>, accept: boolean) {
    setBusyId(item.id);
    setError(null);
    startTransition(async () => {
      const result = accept
        ? await acceptFriendRequest(item.requesterId)
        : await rejectFriendRequest(item.requesterId);
      setBusyId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      router.refresh();
    });
  }

  return (
    <div className="notifications-wrap">
      <button
        ref={buttonRef}
        type="button"
        className="btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Notificaciones
        {items.length > 0 && <span className="count">{items.length}</span>}
      </button>

      <section
        ref={panelRef}
        id={panelId}
        className="notifications-panel panel panel--neon"
        hidden={!open}
        aria-label="Notificaciones"
      >
        <div className="in">
          <h2>Notificaciones</h2>
          {items.length === 0 ? (
            <p className="tagline">No tenés notificaciones nuevas.</p>
          ) : (
            <ul className="notifications-list">
              {items.map((item) =>
                item.kind === "friend" ? (
                  <li key={item.id} className="notification notification--friend">
                    <Link href={item.href} onClick={() => setOpen(false)}>
                      {item.text}
                    </Link>
                    <div className="notification-actions">
                      <button
                        type="button"
                        className="btn btn--solid"
                        disabled={busyId === item.id}
                        onClick={() => respond(item, true)}
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        className="btn"
                        disabled={busyId === item.id}
                        onClick={() => respond(item, false)}
                      >
                        Rechazar
                      </button>
                    </div>
                  </li>
                ) : (
                  <li key={item.id}>
                    <Link href={item.href} onClick={() => setOpen(false)}>
                      {item.text}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          )}
          {error && (
            <small className="form-field-error" role="alert">
              {error}
            </small>
          )}
        </div>
      </section>
    </div>
  );
}
