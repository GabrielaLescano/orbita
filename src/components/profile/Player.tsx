"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { formatTime } from "@/lib/format";
import { addTrack, removeTrack } from "./track-actions";

import type { CSSVars } from "@/types/css";
import type { Track } from "@/types/profile";

const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const BARS = Array.from({ length: 26 }, (_, n) => ({
  duration: 600 + ((n * 137) % 700),
  scale: 0.35 + ((n * 53) % 65) / 100,
  delay: -((n * 211) % 800),
}));

type SCWidget = {
  bind: (
    event: string,
    cb: (data?: { currentPosition?: number }) => void
  ) => void;
  play: () => void;
  pause: () => void;
  load: (
    url: string,
    options: { auto_play?: boolean; callback?: () => void }
  ) => void;
  getDuration: (cb: (ms: number) => void) => void;
  setVolume: (volume: number) => void;
};

type SCWidgetEvents = {
  PLAY: string;
  PAUSE: string;
  FINISH: string;
  PLAY_PROGRESS: string;
  READY: string;
};

type SCNamespace = {
  Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
    Events: SCWidgetEvents;
  };
};

declare global {
  interface Window {
    SC?: SCNamespace;
  }
}

const WIDGET_SCRIPT_SRC = "https://w.soundcloud.com/player/api.js";

let widgetApiPromise: Promise<SCNamespace> | null = null;

/** Carga el script de la Widget API una sola vez, sin importar cuántos <Player> haya montados. */
function loadSoundcloudWidgetApi(): Promise<SCNamespace> {
  if (widgetApiPromise) return widgetApiPromise;

  widgetApiPromise = new Promise((resolve, reject) => {
    if (window.SC) {
      resolve(window.SC);
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;

    script.onload = () => {
      if (window.SC) resolve(window.SC);
      else reject(new Error("SC no se cargó"));
    };

    script.onerror = () => {
      reject(new Error("No se pudo cargar la Widget API de SoundCloud"));
    };

    document.head.appendChild(script);
  });

  return widgetApiPromise;
}

/**
 * Genera la URL del iframe de SoundCloud.
 * La interfaz visible del reproductor la implementamos nosotros.
 * Se conserva el enlace de atribución "Escuchar en SoundCloud".
 */
function playerUrl(trackUrl: string): string {
  const params = new URLSearchParams({
    url: trackUrl,
    auto_play: "false",
    show_artwork: "false",
    visual: "false",
    buying: "false",
    liking: "false",
    sharing: "false",
    download: "false",
    show_comments: "false",
    show_playcount: "false",
    show_user: "false",
    hide_related: "true",
  });

  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

export function Player({
  tracks,
  isOwner,
}: {
  tracks: Track[];
  isOwner: boolean;
}) {
  const [trackList, setTrackList] = useState<Track[]>(tracks);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [ready, setReady] = useState(false);
  const [volume, setVolume] = useState(100);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addPending, startAddTransition] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removePending, startRemoveTransition] = useTransition();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);

  const track = trackList[index];

  const trackListRef = useRef(trackList);
  const indexRef = useRef(index);

  trackListRef.current = trackList;
  indexRef.current = index;

  const initialIframeUrl = useRef<string | null>(null);

  if (track && !initialIframeUrl.current) {
    initialIframeUrl.current = playerUrl(track.soundcloudUrl);
  }

  useEffect(() => {
    if (!track || !iframeRef.current) return;

    let cancelled = false;

    loadSoundcloudWidgetApi()
      .then((SC) => {
        if (cancelled || !iframeRef.current) return;

        const widget = SC.Widget(iframeRef.current);
        widgetRef.current = widget;

        widget.bind(SC.Widget.Events.READY, () => {
          if (cancelled) return;

          setReady(true);

          widget.getDuration((ms) => {
            if (!cancelled) setDurationMs(ms);
          });
        });

        widget.bind(SC.Widget.Events.PLAY, () => {
          if (!cancelled) setPlaying(true);
        });

        widget.bind(SC.Widget.Events.PAUSE, () => {
          if (!cancelled) setPlaying(false);
        });

        widget.bind(SC.Widget.Events.FINISH, () => {
          if (!cancelled) goNext();
        });

        widget.bind(SC.Widget.Events.PLAY_PROGRESS, (data) => {
          if (!cancelled && data?.currentPosition !== undefined) {
            setPositionMs(data.currentPosition);
          }
        });
      })
      .catch((error: unknown) => {
        console.error("[SC] Initialization error:", error);

        if (!cancelled) {
          setLoadError("No se pudo cargar el reproductor de SoundCloud.");
        }
      });

    return () => {
      cancelled = true;
      widgetRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(track)]);

  function loadIndex(newIndex: number, autoPlay: boolean) {
    const currentTracks = trackListRef.current;
    const next = currentTracks[newIndex];

    if (!next || !widgetRef.current) return;

    setIndex(newIndex);
    setPositionMs(0);
    setDurationMs(0);
    setReady(false);
    setLoadError(null);

    widgetRef.current.load(next.soundcloudUrl, {
      auto_play: autoPlay,
      callback: () => {
        setReady(true);
        widgetRef.current?.getDuration(setDurationMs);
      },
    });
  }

  function goNext() {
    const tracks = trackListRef.current;
    if (!tracks.length) return;

    loadIndex((indexRef.current + 1) % tracks.length, true);
  }

  function goPrev() {
    const tracks = trackListRef.current;
    if (!tracks.length) return;

    loadIndex((indexRef.current - 1 + tracks.length) % tracks.length, true);
  }

  function togglePlay() {
    if (!widgetRef.current) return;

    if (playing) widgetRef.current.pause();
    else widgetRef.current.play();
  }

  function selectTrack(n: number) {
    if (n === index) {
      togglePlay();
      return;
    }

    loadIndex(n, true);
  }

  function onVolumeChange(value: number) {
    setVolume(value);
    widgetRef.current?.setVolume(value);
  }

  function handleAddTrack() {
    const value = addUrl.trim();
    if (!value) return;

    setAddError(null);

    startAddTransition(async () => {
      const result = await addTrack(value);

      if (!result.ok) {
        setAddError(result.error);
        return;
      }

      setTrackList((prev) => [...prev, result.track]);
      setAddUrl("");
    });
  }

  function handleRemoveTrack(trackId: string) {
    const removingIndex = trackList.findIndex((item) => item.id === trackId);
    if (removingIndex === -1) return;

    setRemoveError(null);

    startRemoveTransition(async () => {
      const result = await removeTrack(trackId);

      if (!result.ok) {
        setRemoveError(result.error);
        return;
      }

      const newList = trackList.filter((item) => item.id !== trackId);
      setTrackList(newList);

      if (newList.length === 0) {
        initialIframeUrl.current = null;
        widgetRef.current?.pause();

        setPlaying(false);
        setReady(false);
        setPositionMs(0);
        setDurationMs(0);
        setIndex(0);
        return;
      }

      if (removingIndex === index) {
        const nextIndex = Math.min(removingIndex, newList.length - 1);

        setIndex(nextIndex);
        setPositionMs(0);
        setDurationMs(0);
        setPlaying(false);
        setReady(false);

        widgetRef.current?.load(newList[nextIndex].soundcloudUrl, {
          auto_play: false,
          callback: () => {
            setReady(true);
            widgetRef.current?.getDuration(setDurationMs);
          },
        });
      } else if (removingIndex < index) {
        setIndex(index - 1);
      }
    });
  }

  const editToggle = isOwner && (
    <button
      type="button"
      className="player-edit-toggle"
      onClick={() => setEditing((current) => !current)}
    >
      {editing ? "Listo" : "Editar"}
    </button>
  );

  if (!track) {
    return (
      <div className="panel panel--neon">
        <div className="in">
          <div className="player-head">
            <p className="tagline" style={{ margin: 0 }}>
              Todavía no agregaste ninguna canción.
            </p>
            {editToggle}
          </div>

          {isOwner && editing && (
            <AddTrackForm
              url={addUrl}
              setUrl={setAddUrl}
              onAdd={handleAddTrack}
              pending={addPending}
              error={addError}
            />
          )}
        </div>
      </div>
    );
  }

  const offset =
    durationMs > 0
      ? CIRCUMFERENCE * (1 - positionMs / durationMs)
      : CIRCUMFERENCE;

  return (
    <div className={`glow${playing ? " playing" : ""}`}>
      <div className="panel panel--neon">
        <div className="in">
          {editToggle}

          <iframe
            ref={iframeRef}
            src={initialIframeUrl.current ?? undefined}
            title="Reproductor de SoundCloud"
            className="player-hidden-frame"
            allow="autoplay"
          />

          <div className="player-top">
            <div className="ring">
              <svg viewBox="0 0 200 200" aria-hidden="true">
                <defs>
                  <linearGradient
                    id="player-gradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop
                      offset="0"
                      style={{ stopColor: "var(--accent-1)" }}
                    />
                    <stop
                      offset="1"
                      style={{ stopColor: "var(--accent-2)" }}
                    />
                  </linearGradient>
                </defs>

                <circle
                  className="deco"
                  cx="100"
                  cy="100"
                  r="96"
                  fill="none"
                  strokeOpacity=".5"
                  strokeWidth="2"
                  strokeDasharray="2 9"
                  strokeLinecap="round"
                  style={{ stroke: "var(--accent-2)" }}
                />

                <circle
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  strokeWidth="6"
                  style={{ stroke: "var(--line)" }}
                />

                <circle
                  cx="100"
                  cy="100"
                  r={RADIUS}
                  fill="none"
                  stroke="url(#player-gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={offset}
                />
              </svg>

              <button
                type="button"
                className="playbtn"
                aria-label={playing ? "Pausar" : "Reproducir"}
                aria-pressed={playing}
                disabled={!ready}
                onClick={togglePlay}
              >
                {playing ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="meta">
              <p className="track-title">{track.title}</p>
              <p className="track-artist">{track.artist}</p>

              <div className="bars" aria-hidden="true">
                {BARS.map((bar, n) => (
                  <span
                    key={n}
                    style={
                      {
                        "--d": `${bar.duration}ms`,
                        "--s": bar.scale.toFixed(2),
                        animationDelay: `${bar.delay}ms`,
                      } as CSSVars
                    }
                  />
                ))}
              </div>

              <div className="time">
                <span>{formatTime(positionMs / 1000)}</span>
                <span>{formatTime(durationMs / 1000)}</span>
              </div>

              <div className="skip">
                <button
                  type="button"
                  aria-label="Tema anterior"
                  onClick={goPrev}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6 6h2v12H6zM9.5 12 18 18V6z" />
                  </svg>
                </button>

                <button
                  type="button"
                  aria-label="Tema siguiente"
                  onClick={goNext}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
                  </svg>
                </button>

                <input
                  type="range"
                  className="volume"
                  min={0}
                  max={100}
                  value={volume}
                  aria-label="Volumen"
                  onChange={(event) =>
                    onVolumeChange(Number(event.target.value))
                  }
                />
              </div>

              <a
                className="sc-attribution"
                href={track.soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escuchar en SoundCloud ↗
              </a>
            </div>
          </div>

          {loadError && (
            <p className="form-field-error" role="alert">
              {loadError}
            </p>
          )}

          <ul className="playlist">
            {trackList.map((item, n) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={n === index}
                  onClick={() => selectTrack(n)}
                >
                  <span>
                    {item.title} · {item.artist}
                  </span>
                </button>

                {isOwner && editing && (
                  <button
                    type="button"
                    className="playlist-remove"
                    disabled={removePending}
                    onClick={() => handleRemoveTrack(item.id)}
                  >
                    Quitar
                  </button>
                )}
              </li>
            ))}
          </ul>

          {removeError && (
            <p className="form-field-error" role="alert">
              {removeError}
            </p>
          )}

          {isOwner && editing && (
            <AddTrackForm
              url={addUrl}
              setUrl={setAddUrl}
              onAdd={handleAddTrack}
              pending={addPending}
              error={addError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type AddTrackFormProps = {
  url: string;
  setUrl: (value: string) => void;
  onAdd: () => void;
  pending: boolean;
  error: string | null;
};

function AddTrackForm({
  url,
  setUrl,
  onAdd,
  pending,
  error,
}: AddTrackFormProps) {
  return (
    <div className="player-add">
      <input
        type="url"
        value={url}
        placeholder="https://soundcloud.com/usuario/tema"
        aria-label="Link de SoundCloud"
        disabled={pending}
        onChange={(event) => setUrl(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onAdd();
        }}
      />

      <button
        type="button"
        className="btn"
        disabled={pending || !url.trim()}
        onClick={onAdd}
      >
        {pending ? "Agregando…" : "Agregar"}
      </button>

      {error && (
        <p className="form-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
