import { and, eq, gt, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { getProfileIdByUserId } from "./get-profile";

/**
 * Cuánta actividad nueva (comentarios y respuestas de otras personas) tiene
 * pendiente de ver userId, desde la última vez que entró a su propio perfil.
 * Suma dos cosas, sin pisarse entre sí:
 *  A) cualquier comentario o respuesta nuevo en SU muro (su propio perfil);
 *  B) respuestas nuevas a comentarios que ÉL dejó en el muro de OTRA persona
 *     (ahí no aplica el punto A, porque el perfil no es el suyo).
 * En los dos casos se excluyen los comentarios del propio userId: no te
 * avisamos de que vos mismo comentaste o te respondiste a vos mismo.
 */
export async function countNewActivity(userId: string): Promise<number> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { notificationsSeenAt: true },
  });
  if (!user) return 0;
  const since = user.notificationsSeenAt;

  const ownProfileId = await getProfileIdByUserId(userId);

  const onMyWall = ownProfileId
    ? db.query.comments.findMany({
        where: and(
          eq(comments.profileId, ownProfileId),
          ne(comments.authorId, userId),
          gt(comments.createdAt, since),
        ),
        columns: { id: true },
      })
    : Promise.resolve([]);

  // Mis propios comentarios en CUALQUIER perfil (para encontrar respuestas a ellos).
  const myCommentIds = await db.query.comments.findMany({
    where: eq(comments.authorId, userId),
    columns: { id: true },
  });

  const repliesToMeElsewhere =
    myCommentIds.length === 0
      ? Promise.resolve([])
      : db.query.comments.findMany({
          where: and(
            inArray(comments.parentId, myCommentIds.map((c) => c.id)),
            ne(comments.authorId, userId),
            gt(comments.createdAt, since),
            // Lo que ya cuenta el punto A (ownProfileId) no se vuelve a contar acá.
            ownProfileId ? ne(comments.profileId, ownProfileId) : undefined,
          ),
          columns: { id: true },
        });

  const [mine, replies] = await Promise.all([onMyWall, repliesToMeElsewhere]);
  return mine.length + replies.length;
}

/** Se llama al entrar a tu propio perfil: "ya viste todo hasta ahora". */
export async function markNotificationsSeen(userId: string): Promise<void> {
  await db.update(users).set({ notificationsSeenAt: new Date() }).where(eq(users.id, userId));
}
