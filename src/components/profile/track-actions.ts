"use server";

import { and, eq, max } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { tracks } from "@/db/schema";
import { getProfileIdByUserId } from "@/data/get-profile";
import { fetchSoundcloudMetadata, isValidSoundcloudUrl } from "@/lib/soundcloud";
import type { Track } from "@/types/profile";

export type AddTrackResult = { ok: true; track: Track } | { ok: false; error: string };

export async function addTrack(rawUrl: string): Promise<AddTrackResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Iniciá sesión de nuevo." };

  const url = rawUrl.trim();
  if (!isValidSoundcloudUrl(url)) {
    return { ok: false, error: "Tiene que ser el link a un tema de SoundCloud (soundcloud.com/usuario/tema)." };
  }

  const profileId = await getProfileIdByUserId(session.user.id);
  if (!profileId) return { ok: false, error: "Creá tu perfil antes de agregar música." };

  const metadata = await fetchSoundcloudMetadata(url);

  const [{ value: lastPosition }] = await db
    .select({ value: max(tracks.position) })
    .from(tracks)
    .where(eq(tracks.profileId, profileId));

  const [row] = await db
    .insert(tracks)
    .values({
      profileId,
      soundcloudUrl: url,
      title: metadata?.title ?? "Tema de SoundCloud",
      artist: metadata?.artist ?? "Desconocido",
      position: (lastPosition ?? -1) + 1,
    })
    .returning({ id: tracks.id, title: tracks.title, artist: tracks.artist, soundcloudUrl: tracks.soundcloudUrl });

  return { ok: true, track: row };
}

export type RemoveTrackResult = { ok: true } | { ok: false; error: string };

/** Saca un tema del perfil propio. Verifica que de verdad sea tuyo antes de borrarlo. */
export async function removeTrack(trackId: string): Promise<RemoveTrackResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Iniciá sesión de nuevo." };

  const profileId = await getProfileIdByUserId(session.user.id);
  if (!profileId) return { ok: false, error: "No tenés perfil." };

  await db.delete(tracks).where(and(eq(tracks.id, trackId), eq(tracks.profileId, profileId)));
  return { ok: true };
}
