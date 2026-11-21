"use client";

import { useId, useState, useTransition } from "react";
import { addTrack, removeTrack } from "@/components/profile/track-actions";
import type { Track } from "@/types/profile";

export function TrackManager({ initial }: { initial: Track[] }) {
  const [tracks, setTracks] = useState<Track[]>(initial);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const urlId = useId();

  function add() {
    const value = url.trim();
    if (!value) return;
    setError(null);
    startTransition(async () => {
      const result = await addTrack(value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTracks((prev) => [...prev, result.track]);
      setUrl("");
    });
  }

  function remove(trackId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeTrack(trackId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    });
  }

  return (
    <div className="panel" style={{ marginTop: 20 }}>
      <div className="in">
        <h2>Música</h2>
        {tracks.length === 0 ? (
          <p className="tagline">Todavía no agregaste ninguna canción.</p>
        ) : (
          <ul className="track-manager-list">
            {tracks.map((t) => (
              <li key={t.id}>
                <div>
                  <b>{t.title}</b>
                  <span className="track-manager-artist">{t.artist}</span>
                </div>
                <button type="button" className="btn" disabled={pending} onClick={() => remove(t.id)}>
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}

        <label htmlFor={urlId} className="field-label" style={{ display: "block", marginTop: 16 }}>
          Agregar tema de SoundCloud
        </label>
        <div className="track-manager-add">
          <input
            id={urlId}
            type="url"
            value={url}
            placeholder="https://soundcloud.com/usuario/tema"
            disabled={pending}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
          />
          <button type="button" className="btn btn--solid" disabled={pending || !url.trim()} onClick={add}>
            {pending ? "Agregando…" : "Agregar"}
          </button>
        </div>
        <small>
          Necesitás una cuenta gratuita de SoundCloud para subir tu música y conseguir el link. Quien
          escuche no necesita ninguna cuenta.
        </small>
        {error && (
          <p className="form-field-error" role="alert" style={{ marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
