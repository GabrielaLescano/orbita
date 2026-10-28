"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { comments, profiles } from "@/db/schema";
import { getHandleByUserId, hueFromId } from "@/data/get-profile";
import type { ProfileComment } from "@/types/profile";

export type PostCommentResult = { ok: true; comment: ProfileComment } | { ok: false; error: string };

export async function postComment(
  profileId: string,
  rawBody: string,
  parentId?: string | null,
): Promise<PostCommentResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Iniciá sesión para comentar." };
  }

  const body = rawBody.trim();
  if (!body) return { ok: false, error: "Escribí algo antes de publicar." };
  if (body.length > 140) return { ok: false, error: "Hasta 140 caracteres." };

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, profileId),
    columns: { id: true },
  });
  if (!profile) return { ok: false, error: "Este perfil ya no existe." };

  if (parentId) {
    const parent = await db.query.comments.findFirst({
      where: eq(comments.id, parentId),
      columns: { profileId: true, parentId: true },
    });
    if (!parent || parent.profileId !== profileId) {
      return { ok: false, error: "Ese comentario ya no existe." };
    }
    if (parent.parentId) {
      return { ok: false, error: "No se puede responder a una respuesta." };
    }
  }

  const [[row], handle] = await Promise.all([
    db
      .insert(comments)
      .values({ profileId, authorId: session.user.id, parentId: parentId ?? null, body })
      .returning({ id: comments.id, createdAt: comments.createdAt }),
    getHandleByUserId(session.user.id),
  ]);

  return {
    ok: true,
    comment: {
      id: row.id,
      author: session.user.name ?? "usuario",
      handle,
      initial: (session.user.name ?? "?").charAt(0).toUpperCase(),
      hue: hueFromId(session.user.id),
      body,
      postedLabel: row.createdAt.toLocaleDateString("es-AR", { day: "numeric", month: "short" }),
      replies: [],
    },
  };
}
