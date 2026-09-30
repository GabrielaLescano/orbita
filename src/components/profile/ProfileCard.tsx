import type { Profile } from "@/types/profile";
import { FriendActions } from "./FriendActions";

type Props = Pick<Profile, "handle" | "tagline" | "status" | "stats">;

export function ProfileCard({ handle, tagline, status, stats }: Props) {
  return (
    <div className="panel">
      <div className="in">
        <h1 className="name">{handle}</h1>
        <p className="tagline">{tagline}</p>
        <div className="mood">
          <span className="dot" />
          {status}
        </div>
        <dl className="stats">
          <div>
            <dt>visitas</dt>
            <dd>{stats.visits.toLocaleString("es-AR")}</dd>
          </div>
          <div>
            <dt>amigos</dt>
            <dd>{stats.friends}</dd>
          </div>
          <div>
            <dt>miembro desde</dt>
            <dd>{stats.memberSince}</dd>
          </div>
        </dl>
        <FriendActions />
      </div>
    </div>
  );
}
