"use server";

import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { friendships } from "@/db/schema";
import type { FriendshipStatus } from "@/data/friends";

export type SendFriendRequestResult =
  | { ok: true; status: FriendshipStatus }
  | { ok: false; error: string };

export async function sendFriendRequest(targetUserId: string): Promise<SendFriendRequestResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Iniciá sesión para agregar amigos." };

  const viewerId = session.user.id;
  if (viewerId === targetUserId) return { ok: false, error: "No podés agregarte a vos mismo." };

  const existing = await db.query.friendships.findFirst({
    where: and(eq(friendships.userId, viewerId), eq(friendships.friendId, targetUserId)),
  });
  if (existing) return { ok: true, status: existing.status as FriendshipStatus };

  const reverse = await db.query.friendships.findFirst({
    where: and(eq(friendships.userId, targetUserId), eq(friendships.friendId, viewerId)),
  });

  const status: FriendshipStatus = reverse ? "accepted" : "pending";
  await db.insert(friendships).values({ userId: viewerId, friendId: targetUserId, status });

  if (reverse && reverse.status !== "accepted") {
    await db.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, reverse.id));
  }

  return { ok: true, status };
}

export type RespondResult = { ok: true } | { ok: false; error: string };

export async function acceptFriendRequest(requesterId: string): Promise<RespondResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Iniciá sesión de nuevo." };
  const viewerId = session.user.id;

  const incoming = await db.query.friendships.findFirst({
    where: and(eq(friendships.userId, requesterId), eq(friendships.friendId, viewerId)),
  });
  if (!incoming || incoming.status !== "pending") {
    return { ok: false, error: "Esa solicitud ya no está disponible." };
  }

  await db.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, incoming.id));

  const reverse = await db.query.friendships.findFirst({
    where: and(eq(friendships.userId, viewerId), eq(friendships.friendId, requesterId)),
  });
  if (reverse) {
    if (reverse.status !== "accepted") {
      await db.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, reverse.id));
    }
  } else {
    await db.insert(friendships).values({ userId: viewerId, friendId: requesterId, status: "accepted" });
  }

  return { ok: true };
}

export async function rejectFriendRequest(requesterId: string): Promise<RespondResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Iniciá sesión de nuevo." };

  await db
    .delete(friendships)
    .where(and(eq(friendships.userId, requesterId), eq(friendships.friendId, session.user.id)));

  return { ok: true };
}
