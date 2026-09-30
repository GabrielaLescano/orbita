import { ProfilePage } from "@/components/profile/ProfilePage";
import { demoProfile } from "@/data/demo-profile";

export default function Home() {
  return <ProfilePage profile={demoProfile} />;
}
