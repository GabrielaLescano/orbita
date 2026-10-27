import type { Profile, Friend } from "@/types/profile";
import type { FriendshipStatus, PendingRequest } from "@/data/friends";
import { About } from "./About";
import { Badges } from "./Badges";
import { Comments } from "./Comments";
import { FriendRequests } from "./FriendRequests";
import { Hero } from "./Hero";
import { Player } from "./Player";
import { ProfileCard } from "./ProfileCard";
import { TopBar } from "./TopBar";
import { Top8 } from "./Top8";
import "./profile.css";

type Props = {
  profile: Profile;
  isOwner: boolean;
  isLoggedIn: boolean;
  friendshipStatus: FriendshipStatus;
  top8: Friend[];
  pendingRequests: PendingRequest[];
};

// Las clases o1..o7 solo importan en móvil: ordenan las tarjetas en una columna.
export function ProfilePage({
  profile,
  isOwner,
  isLoggedIn,
  friendshipStatus,
  top8,
  pendingRequests,
}: Props) {
  return (
    <>
      <TopBar theme={profile.theme} profileId={profile.id} isOwner={isOwner} />
      <main className="profile-main">
        <div className="grid">
          <div className="col">
            {isOwner && (
              <div className="o1b">
                <FriendRequests initial={pendingRequests} />
              </div>
            )}
            <div className="o2">
              <ProfileCard
                handle={profile.handle}
                tagline={profile.tagline}
                status={profile.status}
                stats={profile.stats}
                targetUserId={profile.userId}
                isOwner={isOwner}
                isLoggedIn={isLoggedIn}
                friendshipStatus={friendshipStatus}
              />
            </div>
            <div className="o4">
              <About handle={profile.handle} />
            </div>
            <div className="o7">
              <Comments profileId={profile.id} initial={profile.comments} canComment={isLoggedIn} />
            </div>
          </div>

          <div className="col">
            <div className="o1">
              <Hero />
            </div>
            <div className="o3">
              <Player tracks={profile.tracks} />
            </div>
            <div className="o5">
              <Top8 friends={top8} />
            </div>
            <div className="o6">
              <Badges badges={profile.badges} />
            </div>
          </div>
        </div>
      </main>
      <footer className="profile-footer">
        Mockup de diseño: los perfiles, nombres y canciones son de ejemplo.
      </footer>
    </>
  );
}
