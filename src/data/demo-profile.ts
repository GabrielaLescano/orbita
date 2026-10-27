import type { Profile } from "@/types/profile";

export const demoProfile: Profile = {
  id: null,
  userId: null,
  handle: "nova_kid",
  tagline: "Mapeo estrellas de noche y armo playlists para mirarlas.",
  status: "En línea",
  stats: { visits: 1284, friends: 48, memberSince: "mar 2024" },
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
  tracks: [
    { id: "t1", title: "Nocturno en órbita baja", artist: "Vela Azul", durationSec: 214 },
    { id: "t2", title: "Señal de radio a las 3am", artist: "Polvo Estelar", durationSec: 187 },
    { id: "t3", title: "Gravedad cero", artist: "Cometa Club", durationSec: 256 },
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
    { id: "c1", author: "kiro", handle: null, initial: "K", hue: 190, body: "¡La playlist de anoche estuvo increíble! Pasame el tema 2.", postedLabel: "hace 2 h" },
    { id: "c2", author: "vega_9", handle: null, initial: "V", hue: 120, body: "Me copié el fondo de tu perfil, espero que no te moleste.", postedLabel: "ayer" },
    { id: "c3", author: "lumi", handle: null, initial: "L", hue: 45, body: "Cuando subas las fotos de Saturno avisame.", postedLabel: "hace 3 días" },
  ],
  theme: { accent1: "#ff3ddb", accent2: "#27d9f5" },
};
