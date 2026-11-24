import type { Profile } from "@/types/profile";

export const demoProfile: Profile = {
  id: null,
  userId: null,
  handle: "nova_kid",
  tagline: "Mapeo estrellas de noche y armo playlists para mirarlas.",
  status: "En línea",
  stats: { visits: 1284, friends: 48, memberSince: "mar 2024" },
  avatarUrl: null,
  aboutHtml: `
<marquee>bienvenidos a mi órbita</marquee>
<p>Hola, soy Nova. Fotografío el cielo desde la terraza, colecciono mapas estelares viejos y armo listas de música para las noches despejadas.</p>
<p>Si pasás por acá, dejame un comentario o mandame tu tema favorito para mirar el cielo. Más fotos en <a href="https://example.com">mi galería</a>.</p>
<ul class="tags">
  <li>Astrofotografía</li>
  <li>Synthwave</li>
  <li>Mapas estelares</li>
  <li>Café frío</li>
  <li>Ciencia ficción</li>
</ul>
`,
  customCss: `
body { font-family: "Trebuchet MS", system-ui, sans-serif; }
p { margin: 0 0 12px; max-width: 62ch; }
marquee { color: var(--accent-1); font-weight: 600; margin-bottom: 12px; }
a { color: var(--accent-2); }
.tags { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 16px 0 0; list-style: none; }
.tags li { padding: 4px 12px; border: 1px solid var(--accent-2); border-radius: 999px; font-size: 13px; }
`,
  customCssProfile: "",
  tracks: [
    {
        "id": "1",
        "title": "Odd Look (feat. The Weeknd)",
        "artist": "Kavinsky",
        "soundcloudUrl": "https://soundcloud.com/deadcruiser/kavinsky-odd-look-ft-the?si=8d6d22bdd8784137baf894fdb0e306af&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing#t=0%3A10"
    },
    {
        "id": "2",
        "title": "Training Season",
        "artist": "Dua Lipa",
        "soundcloudUrl": "https://soundcloud.com/dualipa/training-season?si=a813780b3c5d4b7a9b91b187e726eadd&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing#t=0%3A20"
    },
],
  badges: [
    { id: "b1", label: "Primeros 100 perfiles", glyph: "✦", earned: true },
    { id: "b2", label: "Playlist destacada", glyph: "♪", earned: true },
    { id: "b3", label: "1.000 visitas", glyph: "★", earned: true },
    { id: "b4", label: "Tema propio", glyph: "✎", earned: true },
    { id: "b5", label: "Racha de 30 días", glyph: "▲", earned: false },
    { id: "b6", label: "Invitó a 10 amigos", glyph: "●", earned: false },
  ],
  comments: [
    {
      id: "c1", author: "kiro", handle: null, avatarUrl: null, initial: "K", hue: 190,
      body: "¡La playlist de anoche estuvo increíble! Pasame el tema 2.", postedLabel: "hace 2 h",
      replies: [
        { id: "c1-r1", author: "nova_kid", handle: "nova_kid", avatarUrl: null, initial: "N", hue: 300,
          body: "¡Se llama Nocturno en órbita baja! Lo agrego al Top 8 jaja.", postedLabel: "hace 1 h", replies: [] },
      ],
    },
    { id: "c2", author: "vega_9", handle: null, avatarUrl: null, initial: "V", hue: 120, body: "Me copié el fondo de tu perfil, espero que no te moleste.", postedLabel: "ayer", replies: [] },
    { id: "c3", author: "lumi", handle: null, avatarUrl: null, initial: "L", hue: 45, body: "Cuando subas las fotos de Saturno avisame.", postedLabel: "hace 3 días", replies: [] },
  ],
  theme: { accent1: "#ff3ddb", accent2: "#27d9f5" },
};
