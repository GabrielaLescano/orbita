import type { Badge } from "@/types/profile";

export function Badges({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="panel">
      <div className="in">
        <h2>Insignias</h2>
        <ul className="badges">
          {badges.map((b) => (
            <li
              key={b.id}
              className={`badge hex${b.earned ? "" : " off"}`}
              title={b.earned ? b.label : `${b.label} (bloqueada)`}
            >
              <span className="glyph" aria-hidden="true">
                {b.glyph}
              </span>
              <span className="sr-only">
                {b.earned ? b.label : `${b.label} (bloqueada)`}
              </span>
            </li>
          ))}
        </ul>
        <p className="badges-note">
          {earned} de {badges.length} conseguidas
        </p>
      </div>
    </div>
  );
}
