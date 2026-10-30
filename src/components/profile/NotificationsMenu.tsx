"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NotificationItem } from "@/data/notifications";

export function NotificationsMenu({ initial }: { initial: NotificationItem[] }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        {initial.length > 0 && <span className="count">{initial.length}</span>}
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
          {initial.length === 0 ? (
            <p className="tagline">No tenés notificaciones nuevas.</p>
          ) : (
            <ul className="notifications-list">
              {initial.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} onClick={() => setOpen(false)}>
                    {n.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
