import Link from "next/link";
import type { CSSVars } from "@/types/css";
import type { Friend } from "@/types/profile";

export function Top8({ friends }: { friends: Friend[] }) {
  return (
    <div className="panel">
      <div className="in">
        <h2>Top 8</h2>
        {friends.length > 0 ? (
          <ul className="friends">
            {friends.map((f) => (
              <li key={f.id}>
                <Link href={`/u/${f.handle}`}>
                  <span className={`hex${f.online ? " on" : ""}`} style={{ "--h": f.hue } as CSSVars}>
                    {f.initial}
                  </span>
                  {f.handle}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="tagline">Todavía no tiene amigos agregados.</p>
        )}
      </div>
    </div>
  );
}
