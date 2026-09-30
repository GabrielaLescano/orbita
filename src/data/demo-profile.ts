import type { Profile } from "@/types/profile";

export const demoProfile: Profile = {
  handle: "nova_kid",
  tagline: "Mapeo estrellas de noche y armo playlists para mirarlas.",
  status: "En línea",
  stats: { visits: 1284, friends: 48, memberSince: "mar 2024" },
  aboutParagraphs: [
    "Hola, soy Nova. Fotografío el cielo desde la terraza, colecciono mapas estelares viejos y armo listas de música para las noches despejadas.",
    "Si pasás por acá, dejame un comentario o mandame tu tema favorito para mirar el cielo.",
  ],
  interests: [
    "Astrofotografía",
    "Synthwave",
    "Mapas estelares",
    "Café frío",
    "Ciencia ficción",
  ],
  tracks: [
    { id: "t1", title: "Nocturno en órbita baja", artist: "Vela Azul", durationSec: 214 },
    { id: "t2", title: "Señal de radio a las 3am", artist: "Polvo Estelar", durationSec: 187 },
    { id: "t3", title: "Gravedad cero", artist: "Cometa Club", durationSec: 256 },
  ],
  top8: [
    { id: "f1", handle: "kiro", initial: "K", hue: 190, online: true },
    { id: "f2", handle: "vega_9", initial: "V", hue: 120, online: false },
    { id: "f3", handle: "lumi", initial: "L", hue: 45, online: true },
    { id: "f4", handle: "tato", initial: "T", hue: 330, online: false },
    { id: "f5", handle: "mara.s", initial: "M", hue: 260, online: false },
    { id: "f6", handle: "eclipse", initial: "E", hue: 10, online: true },
    { id: "f7", handle: "pilar", initial: "P", hue: 160, online: false },
    { id: "f8", handle: "zeta", initial: "Z", hue: 220, online: false },
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
    { id: "c1", author: "kiro", initial: "K", hue: 190, body: "¡La playlist de anoche estuvo increíble! Pasame el tema 2.", postedLabel: "hace 2 h" },
    { id: "c2", author: "vega_9", initial: "V", hue: 120, body: "Me copié el fondo de tu perfil, espero que no te moleste.", postedLabel: "ayer" },
    { id: "c3", author: "lumi", initial: "L", hue: 45, body: "Cuando subas las fotos de Saturno avisame.", postedLabel: "hace 3 días" },
  ],
  theme: { accent1: "#ff3ddb", accent2: "#27d9f5" },
};
