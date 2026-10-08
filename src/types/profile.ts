export type Track = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
};

export type Friend = {
  id: string;
  handle: string;
  initial: string;
  /** Matiz HSL (0-360) para el avatar hexagonal. */
  hue: number;
  online: boolean;
};

// Se llama ProfileComment para no chocar con el tipo global Comment del DOM.
export type ProfileComment = {
  id: string;
  author: string;
  initial: string;
  hue: number;
  body: string;
  /** Por ahora un texto fijo; más adelante se calcula desde una fecha. */
  postedLabel: string;
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
  handle: string;
  tagline: string;
  status: string;
  stats: ProfileStats;
  // Lo que escribe la persona. Se sanitiza (sanitizeHtml / sanitizeCss) y se muestra
  // dentro de un iframe aislado: ver src/app/p/[handle]/content/route.ts.
  aboutHtml: string;
  customCss: string;
  tracks: Track[];
  top8: Friend[];
  badges: Badge[];
  comments: ProfileComment[];
  theme: ThemeTokens;
};
