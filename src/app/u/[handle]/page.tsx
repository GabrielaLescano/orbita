import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHandleByUserId, getProfileByHandle } from "@/data/get-profile";
import { getFriendshipStatus, getPendingRequests, getTop8 } from "@/data/friends";
import { markNotificationsSeen } from "@/data/notifications";
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
  // profile.userId es null para el perfil de ejemplo: nadie es "su dueño".
  const isOwner = viewerId !== null && viewerId === profile.userId;

  if (viewerId !== null && !isOwner) {
    const ownHandle = await getHandleByUserId(viewerId);
    if (!ownHandle) redirect("/perfil/editar");
  }

  if (isOwner && viewerId) {
    await markNotificationsSeen(viewerId);
  }

  const [top8, friendshipStatus, pendingRequests] = await Promise.all([
    getTop8(profile.userId),
    viewerId && profile.userId && !isOwner
      ? getFriendshipStatus(viewerId, profile.userId)
      : Promise.resolve("none" as const),
    isOwner && profile.userId ? getPendingRequests(profile.userId) : Promise.resolve([]),
  ]);

  return (
    <ProfilePage
      profile={profile}
      isOwner={isOwner}
      isLoggedIn={viewerId !== null}
      friendshipStatus={friendshipStatus}
      top8={top8}
      pendingRequests={pendingRequests}
    />
  );
}
