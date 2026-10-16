import Link from "next/link";
import { AuthButton } from "@/components/profile/AuthButton";

export function LandingHeader() {
  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/" className="logo" aria-label="Órbita, inicio">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle cx="13" cy="13" r="10" fill="none" strokeWidth="2" style={{ stroke: "var(--accent-1)" }} />
            <circle cx="13" cy="13" r="4" style={{ fill: "var(--accent-2)" }} />
            <circle cx="22" cy="9" r="2.4" style={{ fill: "var(--text)" }} />
          </svg>
          órbita
        </Link>
        <span className="spacer" />
        <AuthButton />
      </div>
    </header>
  );
}
