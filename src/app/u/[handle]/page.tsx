import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getProfileByHandle } from "@/data/get-profile";
import { ProfilePage } from "@/components/profile/ProfilePage";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  return { title: `${handle} · Órbita` };
}

export default async function UserProfilePage({ params }: Props) {
  const { handle } = await params;
  const [profile, session] = await Promise.all([getProfileByHandle(handle), auth()]);
  if (!profile) notFound();

  const viewerId = session?.user?.id ?? null;
  const isOwner = viewerId !== null && viewerId === profile.userId;

  return <ProfilePage profile={profile} isOwner={isOwner} canComment={viewerId !== null} />;
}
