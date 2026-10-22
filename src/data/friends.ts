import { and, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { friendships, users } from "@/db/schema";
import { hueFromId } from "./get-profile";
import type { Friend } from "@/types/profile";

/** El Top 8 del perfil de ejemplo (nova_kid). No corresponde a cuentas reales. */
export const demoTop8: Friend[] = [
  { id: "f1", handle: "kiro", initial: "K", hue: 190, online: true },
  { id: "f2", handle: "vega_9", initial: "V", hue: 120, online: false },
  { id: "f3", handle: "lumi", initial: "L", hue: 45, online: true },
  { id: "f4", handle: "tato", initial: "T", hue: 330, online: false },
  { id: "f5", handle: "mara.s", initial: "M", hue: 260, online: false },
  { id: "f6", handle: "eclipse", initial: "E", hue: 10, online: true },
  { id: "f7", handle: "pilar", initial: "P", hue: 160, online: false },
  { id: "f8", handle: "zeta", initial: "Z", hue: 220, online: false },
];

export type FriendshipStatus = "none" | "pending" | "accepted";

/**
 * Hasta 8 amistades confirmadas del dueño del perfil, con el handle del
 * perfil de cada amigo (para poder linkearlo). Un perfil nuevo sin amigos
 * reales devuelve un arreglo vacío: no se completa con datos de ejemplo,
 * porque esos "amigos" no son cuentas de verdad y el link rompería.
 */
export async function getTop8(ownerUserId: string | null): Promise<Friend[]> {
  if (!ownerUserId) return demoTop8;

  const rows = await db.query.friendships.findMany({
    where: and(
      eq(friendships.status, "accepted"),
      or(eq(friendships.userId, ownerUserId), eq(friendships.friendId, ownerUserId)),
    ),
  });
  if (rows.length === 0) return [];

  const otherIds = rows.map((r) => (r.userId === ownerUserId ? r.friendId : r.userId));

  const others = await db.query.users.findMany({
    where: inArray(users.id, otherIds),
    columns: { id: true, name: true },
    with: { profile: { columns: { handle: true } } },
  });

  // Todavía no hay forma de saber quién está "en línea" de verdad (no hay
  // presencia/websockets), así que por ahora queda siempre en false.
  return others
    .filter((u): u is typeof u & { profile: { handle: string } } => Boolean(u.profile))
    .slice(0, 8)
    .map((u) => ({
      id: u.id,
      handle: u.profile.handle,
      initial: (u.name ?? "?").charAt(0).toUpperCase(),
      hue: hueFromId(u.id),
      online: false,
    }));
}

/** El estado de amistad entre quien mira el perfil y su dueño, visto desde quien mira. */
export async function getFriendshipStatus(
  viewerId: string,
  ownerUserId: string,
): Promise<FriendshipStatus> {
  const row = await db.query.friendships.findFirst({
    where: and(eq(friendships.userId, viewerId), eq(friendships.friendId, ownerUserId)),
    columns: { status: true },
  });
  return row?.status ?? "none";
}
