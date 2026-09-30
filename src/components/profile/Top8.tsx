import type { CSSVars } from "@/types/css";
import type { Friend } from "@/types/profile";

export function Top8({ friends }: { friends: Friend[] }) {
  return (
    <div className="panel">
      <div className="in">
        <h2>Top 8</h2>
        <ul className="friends">
          {friends.map((f) => (
            <li key={f.id}>
              <a href="#">
                <span
                  className={`hex${f.online ? " on" : ""}`}
                  style={{ "--h": f.hue } as CSSVars}
                >
                  {f.initial}
                </span>
                {f.handle}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
