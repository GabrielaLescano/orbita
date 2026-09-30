import type { ThemeTokens } from "@/types/profile";
import { ThemeMenu } from "./ThemeMenu";

export function TopBar({ theme }: { theme: ThemeTokens }) {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <a className="logo" href="#" aria-label="Órbita, inicio">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="13" cy="13" r="10" fill="none" strokeWidth="2" style={{ stroke: "var(--accent-1)" }} />
            <circle cx="13" cy="13" r="4" style={{ fill: "var(--accent-2)" }} />
            <circle cx="22" cy="9" r="2.4" style={{ fill: "var(--text)" }} />
          </svg>
          órbita
        </a>
        <nav aria-label="Principal">
          <a href="#" aria-current="page">Perfil</a>
          <a href="#">Explorar</a>
          <a href="#">
            Mensajes<span className="count">3</span>
          </a>
          <a href="#">Blog</a>
        </nav>
        <span className="spacer" />
        <ThemeMenu initial={theme} />
      </div>
    </header>
  );
}
