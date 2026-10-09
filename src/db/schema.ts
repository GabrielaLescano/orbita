import { relations, sql } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

// Un perfil por usuario, identificado por un handle único, ej nova_kid
export const profiles = pgTable(
  "profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    tagline: text("tagline").notNull().default(""),
    status: text("status").notNull().default("En línea"),
    // HTML y CSS YA SANITIZADOS (ver src/lib/sanitize): acá nunca se guarda contenido crudo. El guardado sanitiza una vez; la lectura no vuelve a limpiar.
    aboutHtml: text("about_html").notNull().default(""),
    customCss: text("custom_css").notNull().default(""),
    themeAccent1: text("theme_accent_1").notNull().default("#ff3ddb"),
    themeAccent2: text("theme_accent_2").notNull().default("#27d9f5"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (profile) => [
    // El handle se busca siempre en minúsculas (ver src/data/get-profile.ts);
    // el índice único evita que dos perfiles compitan solo por mayúsculas.
    uniqueIndex("profile_handle_lower_idx").on(sql`lower(${profile.handle})`),
  ],
);

// Temas del reproductor. "position" define el orden dentro del perfil.
export const tracks = pgTable("track", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  durationSec: integer("duration_sec").notNull(),
  position: integer("position").notNull().default(0),
});

// Comentarios que deja otra persona en un perfil. El texto se guarda plano (nunca como HTML): React lo escapa solo al mostrarlo.
export const comments = pgTable("comment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// Amistades dirigidas: A agrega a B. "status" habilita el flujo de solicitudes (pending/accepted) y "position" es el orden manual del Top 8.
export const friendships = pgTable(
  "friendship",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    friendId: text("friend_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").$type<"pending" | "accepted">().notNull().default("pending"),
    position: integer("position"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (friendship) => [
    uniqueIndex("friendship_pair_idx").on(friendship.userId, friendship.friendId),
  ],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  comments: many(comments),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
  tracks: many(tracks),
  comments: many(comments),
}));

export const tracksRelations = relations(tracks, ({ one }) => ({
  profile: one(profiles, { fields: [tracks.profileId], references: [profiles.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  profile: one(profiles, { fields: [comments.profileId], references: [profiles.id] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));
