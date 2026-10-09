import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, profiles, tracks, users } from "@/db/schema";
import type { Profile, ProfileComment, Track } from "@/types/profile";
import { demoProfile } from "./demo-profile";

/** Los handles válidos: letras, números, punto, guion y guion bajo. */
export const HANDLE_PATTERN = /^[a-z0-9_.-]{3,30}$/i;

/**
 * Busca un perfil por handle (sin distinguir mayúsculas).
 *
 * El Top 8 y las insignias todavía no tienen tablas propias (ver src/db/schema.ts):
 * hasta que existan, se completan con los datos de ejemplo para que el perfil no
 * se vea vacío. Comentarios y temas sí salen de la base.
 *
 */
export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  if (!HANDLE_PATTERN.test(handle)) return null;

  const row = await db.query.profiles.findFirst({
    where: eq(profiles.handle, handle.toLowerCase()),
    with: {
      user: { columns: { name: true, image: true } },
      tracks: { orderBy: [asc(tracks.position)] },
      comments: {
        orderBy: [asc(comments.createdAt)],
        with: { author: { columns: { name: true, image: true } } },
      },
    },
  });

  if (!row) {
    return handle.toLowerCase() === demoProfile.handle.toLowerCase() ? demoProfile : null;
  }

  return {
    handle: row.handle,
    tagline: row.tagline,
    status: row.status,
    stats: { visits: 0, friends: 0, memberSince: formatMemberSince(row.createdAt) },
    aboutHtml: row.aboutHtml,
    customCss: row.customCss,
    tracks:
      row.tracks.length > 0
        ? row.tracks.map(
            (t: (typeof row.tracks)[number]): Track => ({
              id: t.id,
              title: t.title,
              artist: t.artist,
              durationSec: t.durationSec,
            }),
          )
        : demoProfile.tracks,
    top8: demoProfile.top8,
    badges: demoProfile.badges,
    comments: row.comments.map((c: (typeof row.comments)[number]): ProfileComment => ({
      id: c.id,
      author: c.author.name ?? "usuario",
      initial: (c.author.name ?? "?").charAt(0).toUpperCase(),
      hue: hueFromId(c.authorId),
      body: c.body,
      postedLabel: c.createdAt.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
    })),
    theme: { accent1: row.themeAccent1, accent2: row.themeAccent2 },
  };
}

/** True si el handle ya está en uso (por cualquier perfil). */
export async function isHandleTaken(handle: string): Promise<boolean> {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.handle, handle.toLowerCase()),
    columns: { id: true },
  });
  return Boolean(existing);
}

export async function getHandleByUserId(userId: string): Promise<string | null> {
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { handle: true },
  });
  return row?.handle ?? null;
}

export async function getProfileIdByUserId(userId: string): Promise<string | null> {
  const row = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true },
  });
  return row?.id ?? null;
}

function formatMemberSince(date: Date): string {
  return date.toLocaleDateString("es-AR", { month: "short", year: "numeric" });
}

/** Matiz HSL estable a partir de un id, para que el avatar de cada autor no cambie entre renders. */
function hueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % 360;
}
