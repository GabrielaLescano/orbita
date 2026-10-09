import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfileByHandle } from "@/data/get-profile";
import { ProfilePage } from "@/components/profile/ProfilePage";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  return { title: `${handle} · Órbita` };
}

export default async function UserProfilePage({ params }: Props) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  return <ProfilePage profile={profile} />;
}
