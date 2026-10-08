import type { Profile } from "@/types/profile";
import { About } from "./About";
import { Badges } from "./Badges";
import { Comments } from "./Comments";
import { Hero } from "./Hero";
import { Player } from "./Player";
import { ProfileCard } from "./ProfileCard";
import { TopBar } from "./TopBar";
import { Top8 } from "./Top8";
import "./profile.css";

// Las clases o1..o7 solo importan en móvil: ordenan las tarjetas en una columna.
export function ProfilePage({ profile }: { profile: Profile }) {
  return (
    <>
      <TopBar theme={profile.theme} />
      <main className="profile-main">
        <div className="grid">
          <div className="col">
            <div className="o2">
              <ProfileCard
                handle={profile.handle}
                tagline={profile.tagline}
                status={profile.status}
                stats={profile.stats}
              />
            </div>
            <div className="o4">
              <About handle={profile.handle} />
            </div>
            <div className="o7">
              <Comments initial={profile.comments} />
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
              <Top8 friends={profile.top8} />
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
