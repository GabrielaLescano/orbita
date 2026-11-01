import { and, desc, eq, inArray, isNull, ne } from "drizzle-orm";
import { db } from "@/db";
import { comments, friendships, profiles } from "@/db/schema";

export type NotificationItem =
  | {
      kind: "friend";
      id: string;
      text: string;
      href: string;
      createdAt: Date;
      requesterId: string;
    }
  | {
      kind: "comment";
      id: string;
      text: string;
      href: string;
      createdAt: Date;
      commentId: string;
    };

const SNIPPET_LEN = 60;
const snippet = (body: string) => (body.length > SNIPPET_LEN ? `${body.slice(0, SNIPPET_LEN)}…` : body);

export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  const ownProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true, handle: true },
  });

  const requestsPromise = db.query.friendships.findMany({
    where: and(eq(friendships.friendId, userId), eq(friendships.status, "pending")),
    orderBy: [desc(friendships.createdAt)],
    with: {
      user: {
        columns: { id: true, name: true },
        with: { profile: { columns: { handle: true } } },
      },
    },
  });

  const onMyWallPromise = ownProfile
    ? db.query.comments.findMany({
        where: and(
          eq(comments.profileId, ownProfile.id),
          ne(comments.authorId, userId),
          isNull(comments.dismissedAt),
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
            isNull(comments.dismissedAt),
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
        kind: "friend",
        id: `friend:${r.id}`,
        text: `${r.user.name ?? "Alguien"} te mandó una solicitud de amistad.`,
        href: r.user.profile ? `/u/${r.user.profile.handle}` : "#",
        createdAt: r.createdAt,
        requesterId: r.user.id,
      }),
    ),
    ...onMyWall.map(
      (c): NotificationItem => ({
        kind: "comment",
        id: `comment:${c.id}`,
        commentId: c.id,
        text: `${c.author.name ?? "Alguien"} comentó en tu perfil: "${snippet(c.body)}"`,
        href: ownProfile ? `/u/${ownProfile.handle}#comment-${c.id}` : "/perfil/editar",
        createdAt: c.createdAt,
      }),
    ),
    ...repliesElsewhere.map(
      (c): NotificationItem => ({
        kind: "comment",
        id: `comment:${c.id}`,
        commentId: c.id,
        text: `${c.author.name ?? "Alguien"} te respondió en el perfil de ${c.profile.handle}: "${snippet(c.body)}"`,
        href: `/u/${c.profile.handle}#comment-${c.id}`,
        createdAt: c.createdAt,
      }),
    ),
  ];

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
