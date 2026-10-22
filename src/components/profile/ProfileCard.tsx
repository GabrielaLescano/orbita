import Link from "next/link";
import type { Profile } from "@/types/profile";
import type { FriendshipStatus } from "@/data/friends";
import { FriendActions } from "./FriendActions";

type Props = Pick<Profile, "handle" | "tagline" | "status" | "stats"> & {
  targetUserId: string | null;
  isOwner: boolean;
  isLoggedIn: boolean;
  friendshipStatus: FriendshipStatus;
};

export function ProfileCard({
  handle,
  tagline,
  status,
  stats,
  targetUserId,
  isOwner,
  isLoggedIn,
  friendshipStatus,
}: Props) {
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
        {isOwner ? (
          <div className="actions">
            <Link href="/perfil/editar" className="btn btn--solid">
              Editar perfil
            </Link>
          </div>
        ) : targetUserId ? (
          <FriendActions targetUserId={targetUserId} initialStatus={friendshipStatus} isLoggedIn={isLoggedIn} />
        ) : (
          <p className="note">Este es un perfil de ejemplo.</p>
        )}
      </div>
    </div>
  );
}
