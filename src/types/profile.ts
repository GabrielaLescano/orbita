export type Track = {
  id: string;
  title: string;
  artist: string;
  soundcloudUrl: string;
};

export type Friend = {
  id: string;
  handle: string;
  /** Foto real del perfil de este amigo, si tiene una. Si no, se usa initial/hue. */
  avatarUrl: string | null;
  initial: string;
  /** Matiz HSL (0-360) para el avatar hexagonal. */
  hue: number;
  online: boolean;
};

// Se llama ProfileComment para no chocar con el tipo global Comment del DOM.
export type ProfileComment = {
  id: string;
  author: string;
  /** null si quien comentó todavía no se creó un perfil: no hay a dónde linkearlo. */
  handle: string | null;
  /** Foto real del perfil de quien comentó, si tiene una. Si no, se usa initial/hue. */
  avatarUrl: string | null;
  initial: string;
  hue: number;
  body: string;
  /** Por ahora un texto fijo; más adelante se calcula desde una fecha. */
  postedLabel: string;
  // Un nivel nada más: las respuestas no tienen, a su vez, sus propias
  // respuestas (se verifica al guardar, en comment-actions.ts).
  replies: ProfileComment[];
};

export type Badge = {
  id: string;
  label: string;
  glyph: string;
  earned: boolean;
};

export type ThemeTokens = {
  accent1: string;
  accent2: string;
};

export type ProfileStats = {
  visits: number;
  friends: number;
  memberSince: string;
};

export type Profile = {
  // El id del perfil y de su dueño en la base. null para el perfil de ejemplo
  // (nova_kid), que no es una fila real: por eso no se le pueden dejar
  // comentarios ni tiene sentido comparar "¿es el mío?" contra él.
  id: string | null;
  userId: string | null;
  handle: string;
  tagline: string;
  status: string;
  stats: ProfileStats;
  /** null = sin foto propia, se muestra la ilustración por defecto (ver Hero.tsx). */
  avatarUrl: string | null;
  // Lo que escribe la persona. Se sanitiza (sanitizeHtml / sanitizeCss) y se muestra
  // dentro de un iframe aislado: ver src/app/p/[handle]/content/route.ts.
  aboutHtml: string;
  customCss: string;
  /** El mismo CSS que customCss, pero sanitizado con scope ".profile-root": se aplica a todo el perfil, no solo al "Sobre mí". */
  customCssProfile: string;
  tracks: Track[];
  // top8 ya NO vive acá: depende de quién lo mira (si sos vos, cuánto llevás de
  // amigo con cada uno) y no solo del perfil en sí. Se calcula en la ruta
  // /u/[handle] con src/data/friends.ts y se pasa a ProfilePage aparte.
  badges: Badge[];
  comments: ProfileComment[];
  theme: ThemeTokens;
};
