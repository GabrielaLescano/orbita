import { and, desc, eq, gt, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { comments, friendships, profiles, users } from "@/db/schema";
import { getProfileIdByUserId } from "./get-profile";

export type NotificationItem = {
  id: string;
  text: string;
  href: string;
  createdAt: Date;
};

const SNIPPET_LEN = 60;
const snippet = (body: string) => (body.length > SNIPPET_LEN ? `${body.slice(0, SNIPPET_LEN)}…` : body);

export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { notificationsSeenAt: true },
  });
  if (!user) return [];
  const since = user.notificationsSeenAt;

  const ownProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true, handle: true },
  });

  const requestsPromise = db.query.friendships.findMany({
    where: and(eq(friendships.friendId, userId), eq(friendships.status, "pending")),
    orderBy: [desc(friendships.createdAt)],
    with: { user: { columns: { name: true } } },
  });

  const onMyWallPromise = ownProfile
    ? db.query.comments.findMany({
        where: and(
          eq(comments.profileId, ownProfile.id),
          ne(comments.authorId, userId),
          gt(comments.createdAt, since),
        ),
        orderBy: [desc(comments.createdAt)],
        with: { author: { columns: { name: true } } },
      })
    : Promise.resolve([]);

  // Mis propios comentarios en CUALQUIER perfil, para encontrar respuestas a ellos.
  const myCommentIds = await db.query.comments.findMany({
    where: eq(comments.authorId, userId),
    columns: { id: true },
  });

  const repliesElsewherePromise =
    myCommentIds.length === 0
      ? Promise.resolve([])
      : db.query.comments.findMany({
          where: and(
            inArray(
              comments.parentId,
              myCommentIds.map((c) => c.id),
            ),
            ne(comments.authorId, userId),
            gt(comments.createdAt, since),
            ownProfile ? ne(comments.profileId, ownProfile.id) : undefined,
          ),
          orderBy: [desc(comments.createdAt)],
          with: {
            author: { columns: { name: true } },
            profile: { columns: { handle: true } },
          },
        });

  const [requests, onMyWall, repliesElsewhere] = await Promise.all([
    requestsPromise,
    onMyWallPromise,
    repliesElsewherePromise,
  ]);

  const items: NotificationItem[] = [
    ...requests.map(
      (r): NotificationItem => ({
        id: `friend:${r.id}`,
        text: `${r.user.name ?? "Alguien"} te mandó una solicitud de amistad.`,
        href: ownProfile ? `/u/${ownProfile.handle}` : "/perfil/editar",
        createdAt: r.createdAt,
      }),
    ),
    ...onMyWall.map(
      (c): NotificationItem => ({
        id: `comment:${c.id}`,
        text: `${c.author.name ?? "Alguien"} comentó en tu perfil: "${snippet(c.body)}"`,
        href: ownProfile ? `/u/${ownProfile.handle}#comment-${c.id}` : "/perfil/editar",
        createdAt: c.createdAt,
      }),
    ),
    ...repliesElsewhere.map(
      (c): NotificationItem => ({
        id: `comment:${c.id}`,
        text: `${c.author.name ?? "Alguien"} te respondió en el perfil de ${c.profile.handle}: "${snippet(c.body)}"`,
        href: `/u/${c.profile.handle}#comment-${c.id}`,
        createdAt: c.createdAt,
      }),
    ),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function countNewActivity(userId: string): Promise<number> {
  return (await getNotifications(userId)).length;
}

/** Se llama al entrar a tu propio perfil: "ya viste todo hasta ahora". */
export async function markNotificationsSeen(userId: string): Promise<void> {
  await db.update(users).set({ notificationsSeenAt: new Date() }).where(eq(users.id, userId));
}
