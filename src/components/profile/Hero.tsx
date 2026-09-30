export function Hero() {
  return (
    <div className="glow">
      <div className="panel panel--neon hero">
        <div className="in">
          <svg viewBox="0 0 520 380" role="img" aria-label="Avatar: astronauta con auriculares frente a un planeta">
            <defs>
              <linearGradient id="hero-sky" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#0a0820" />
                <stop offset="1" stopColor="#1c0b30" />
              </linearGradient>
              <radialGradient id="hero-planet" cx=".35" cy=".3" r=".8">
                <stop offset="0" stopColor="#9fe2ff" />
                <stop offset=".45" stopColor="#2f74dc" />
                <stop offset="1" stopColor="#0a1a48" />
              </radialGradient>
              <radialGradient id="hero-moon" cx=".4" cy=".35" r=".8">
                <stop offset="0" stopColor="#d98bff" />
                <stop offset="1" stopColor="#3a1466" />
              </radialGradient>
              <linearGradient id="hero-suit" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#454a66" />
                <stop offset="1" stopColor="#141726" />
              </linearGradient>
              <linearGradient id="hero-visor" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#2a1a55" />
                <stop offset=".6" stopColor="#070511" />
                <stop offset="1" stopColor="#0d2b3a" />
              </linearGradient>
            </defs>

            <rect width="520" height="380" fill="url(#hero-sky)" />
            <g fill="#fff">
              <circle cx="40" cy="190" r="1.4" />
              <circle cx="110" cy="250" r="1" />
              <circle cx="170" cy="40" r="1.6" />
              <circle cx="300" cy="30" r="1" />
              <circle cx="470" cy="230" r="1.4" />
              <circle cx="500" cy="330" r="1" />
              <circle cx="60" cy="330" r="1.2" />
              <circle cx="230" cy="350" r="1" />
              <circle cx="350" cy="320" r="1.2" />
            </g>

            <circle cx="420" cy="92" r="112" fill="url(#hero-planet)" />
            <circle cx="420" cy="92" r="118" fill="none" strokeOpacity=".35" strokeWidth="3" style={{ stroke: "var(--accent-2)" }} />
            <circle cx="78" cy="78" r="46" fill="url(#hero-moon)" opacity=".8" />

            {/* torso */}
            <path d="M112 380 C112 302 170 262 250 262 C330 262 388 302 388 380 Z" fill="url(#hero-suit)" stroke="#5a6088" strokeWidth="2" />
            <rect x="222" y="314" width="56" height="38" rx="6" fill="#1a1d2f" stroke="#ffb636" strokeWidth="1.5" />
            <circle cx="236" cy="333" r="4" style={{ fill: "var(--accent-2)" }} />
            <circle cx="250" cy="333" r="4" style={{ fill: "var(--accent-1)" }} />
            <circle cx="264" cy="333" r="4" fill="#ffb636" />

            {/* cable */}
            <path d="M344 208 C384 252 338 296 296 306" fill="none" strokeWidth="2" opacity=".8" style={{ stroke: "var(--accent-1)" }} />

            {/* casco */}
            <circle cx="250" cy="170" r="94" fill="#2b2f49" stroke="#525880" strokeWidth="4" />
            <ellipse cx="250" cy="172" rx="71" ry="63" fill="url(#hero-visor)" />
            <ellipse cx="220" cy="146" rx="28" ry="13" transform="rotate(-25 220 146)" fill="#fff" opacity=".13" />
            <path d="M205 210 C235 226 272 226 300 206" fill="none" strokeOpacity=".35" strokeWidth="2" style={{ stroke: "var(--accent-2)" }} />

            {/* auriculares */}
            <path d="M158 152 C164 70 336 70 342 152" fill="none" stroke="#3b405e" strokeWidth="9" />
            <path d="M158 152 C164 70 336 70 342 152" fill="none" strokeWidth="2" style={{ stroke: "var(--accent-1)" }} />
            <ellipse cx="156" cy="176" rx="17" ry="31" fill="#1a0f2e" strokeWidth="4" style={{ stroke: "var(--accent-1)" }} />
            <ellipse cx="344" cy="176" rx="17" ry="31" fill="#1a0f2e" strokeWidth="4" style={{ stroke: "var(--accent-1)" }} />
          </svg>
          <div className="mood">
            <span className="dot" />
            en línea
          </div>
        </div>
      </div>
    </div>
  );
}
