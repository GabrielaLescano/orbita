"use client";

import { useEffect, useMemo, useReducer } from "react";
import { formatTime } from "@/lib/format";
import type { CSSVars } from "@/types/css";
import type { Track } from "@/types/profile";

const RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICK_SECONDS = 0.25;

// Valores fijos (no aleatorios) para que servidor y cliente rendericen lo mismo.
const BARS = Array.from({ length: 26 }, (_, n) => ({
  duration: 600 + ((n * 137) % 700),
  scale: 0.35 + ((n * 53) % 65) / 100,
  delay: -((n * 211) % 800),
}));

type State = { index: number; pos: number; playing: boolean };
type Action =
  | { type: "toggle" }
  | { type: "select"; index: number }
  | { type: "step"; delta: 1 | -1; total: number }
  | { type: "tick"; durations: number[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "toggle":
      return { ...state, playing: !state.playing };
    case "select":
      return { index: action.index, pos: 0, playing: true };
    case "step":
      return {
        ...state,
        index: (state.index + action.delta + action.total) % action.total,
        pos: 0,
      };
    case "tick": {
      const pos = state.pos + TICK_SECONDS;
      if (pos < action.durations[state.index]) return { ...state, pos };
      // Terminó el tema: pasa al siguiente.
      return { ...state, index: (state.index + 1) % action.durations.length, pos: 0 };
    }
  }
}

// Reproductor de maqueta: simula el avance, todavía no reproduce audio.
export function Player({ tracks }: { tracks: Track[] }) {
  const [state, dispatch] = useReducer(reducer, { index: 0, pos: 0, playing: false });
  const durations = useMemo(() => tracks.map((t) => t.durationSec), [tracks]);
  const track = tracks[state.index];

  useEffect(() => {
    if (!state.playing) return;
    const id = window.setInterval(
      () => dispatch({ type: "tick", durations }),
      TICK_SECONDS * 1000,
    );
    return () => window.clearInterval(id);
  }, [state.playing, durations]);

  const offset = CIRCUMFERENCE * (1 - state.pos / track.durationSec);

  return (
    <div className={`glow${state.playing ? " playing" : ""}`}>
      <div className="panel panel--neon">
        <div className="in">
          <div className="player-top">
            <div className="ring">
              <svg viewBox="0 0 200 200" aria-hidden="true">
                <defs>
                  <linearGradient id="player-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" style={{ stopColor: "var(--accent-1)" }} />
                    <stop offset="1" style={{ stopColor: "var(--accent-2)" }} />
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
                <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="6" style={{ stroke: "var(--line)" }} />
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
                aria-label={state.playing ? "Pausar" : "Reproducir"}
                aria-pressed={state.playing}
                onClick={() => dispatch({ type: "toggle" })}
              >
                {state.playing ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="meta">
              <p className="track-title">{track.title}</p>
              <p className="track-artist">{track.artist}</p>
              <div className="bars" aria-hidden="true">
                {BARS.map((b, n) => (
                  <span
                    key={n}
                    style={
                      {
                        "--d": `${b.duration}ms`,
                        "--s": b.scale.toFixed(2),
                        animationDelay: `${b.delay}ms`,
                      } as CSSVars
                    }
                  />
                ))}
              </div>
              <div className="time">
                <span>{formatTime(state.pos)}</span>
                <span>{formatTime(track.durationSec)}</span>
              </div>
              <div className="skip">
                <button
                  type="button"
                  aria-label="Tema anterior"
                  onClick={() => dispatch({ type: "step", delta: -1, total: tracks.length })}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 6h2v12H6zM9.5 12 18 18V6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Tema siguiente"
                  onClick={() => dispatch({ type: "step", delta: 1, total: tracks.length })}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <ul className="playlist">
            {tracks.map((t, n) => (
              <li key={t.id}>
                <button
                  type="button"
                  aria-current={n === state.index}
                  onClick={() => dispatch({ type: "select", index: n })}
                >
                  <span>
                    {t.title} · {t.artist}
                  </span>
                  <span className="d">{formatTime(t.durationSec)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
