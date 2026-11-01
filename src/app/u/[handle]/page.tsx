import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getHandleByUserId, getProfileByHandle, incrementProfileViews } from "@/data/get-profile";
import { getFriendshipStatus, getPendingRequests, getTop8 } from "@/data/friends";
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

  // Logueada sin perfil propio todavía (puede pasar con GitHub, que no pide
  // handle al loguearse) y mirando el perfil de otra persona (o el de
  // ejemplo): afuera a crear el suyo antes de ver, comentar o agregar nada.
  // Así ningún comentario nuevo puede quedar sin handle de quien lo escribió.
  if (viewerId !== null && !isOwner) {
    const ownHandle = await getHandleByUserId(viewerId);
    if (!ownHandle) redirect("/perfil/editar");
  }

  // A propósito, NO hay ningún "marcar todo como visto" acá: visitar tu
  // perfil no debe apagar notificaciones. Cada una se descarta puntualmente
  // (al tocarla, o al responder ese comentario) — ver src/data/notifications.ts.

  // Cuenta la visita si quien mira no es el dueño (logueado o no, da igual)
  // y el perfil es real (profile.id null es el de ejemplo, no tiene fila
  // que incrementar).
  if (!isOwner && profile.id) {
    await incrementProfileViews(profile.id);
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
