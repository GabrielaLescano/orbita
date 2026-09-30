"use client";

import { useId, useState } from "react";
import { themePresets } from "@/lib/theme-presets";
import type { CSSVars } from "@/types/css";
import type { ThemeTokens } from "@/types/profile";

function applyTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  root.style.setProperty("--accent-1", tokens.accent1);
  root.style.setProperty("--accent-2", tokens.accent2);
}

export function ThemeMenu({ initial }: { initial: ThemeTokens }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<ThemeTokens>(initial);

  function update(next: ThemeTokens) {
    setTokens(next);
    applyTokens(next);
  }

  return (
    <>
      <button
        type="button"
        className="btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        Personalizar
      </button>

      <section
        id={panelId}
        className="theme panel panel--neon"
        hidden={!open}
        aria-label="Personalizar el tema"
      >
        <div className="in">
          <h2>Tema del perfil</h2>
          <div className="presets">
            {themePresets.map((p) => (
              <button key={p.name} type="button" onClick={() => update(p.tokens)}>
                <span
                  className="sw"
                  style={{
                    background: `linear-gradient(135deg, ${p.tokens.accent1}, ${p.tokens.accent2})`,
                  } as CSSVars}
                />
                {p.name}
              </button>
            ))}
          </div>
          <label>
            Color principal
            <input
              type="color"
              value={tokens.accent1}
              onChange={(e) => update({ ...tokens, accent1: e.target.value })}
            />
          </label>
          <label>
            Color secundario
            <input
              type="color"
              value={tokens.accent2}
              onChange={(e) => update({ ...tokens, accent2: e.target.value })}
            />
          </label>
          <p className="hint">
            Son variables CSS: cada usuario puede pisarlas con su propio estilo.
          </p>
        </div>
      </section>
    </>
  );
}
