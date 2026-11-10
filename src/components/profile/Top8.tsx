import Link from "next/link";
import { HexAvatar } from "./HexAvatar";
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
                  <HexAvatar
                    avatarUrl={f.avatarUrl}
                    hue={f.hue}
                    initial={f.initial}
                    className={f.online ? "on" : undefined}
                  />
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
