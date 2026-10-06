# Órbita

Red social de perfiles personalizables con música, al estilo MySpace pero pensada para hoy. Cada persona le da a su perfil la estética que quiere, con HTML y CSS propios, y le suma su música.

Es un proyecto personal para practicar arquitectura full-stack con Next.js. El foco está en un problema interesante: **dejar que los usuarios inyecten sus propios estilos sin comprometer la seguridad**.

**Demo:** https://orbita-me.vercel.app

> Estado: en desarrollo. Hoy la demo muestra el diseño del perfil con datos de ejemplo.

## Estado del proyecto

- [x] Diseño de la interfaz y prototipo del perfil, responsive
- [x] Panel de temas: los colores cambian en vivo con variables CSS
- [x] Reproductor con interfaz completa (el audio todavía es simulado)
- [x] Deploy en Vercel
- [ ] Login con GitHub (Auth.js)
- [ ] Base de datos Postgres (Drizzle ORM + Neon)
- [ ] HTML y CSS propios por perfil, con sanitizado y iframe aislado
- [ ] Reproductor con embeds de servicios de música
- [ ] Comentarios y Top 8 reales

## Decisiones de diseño

**Seguridad del contenido del usuario** (plan para la próxima etapa):

- El HTML se sanitiza en el servidor con una lista de etiquetas y atributos permitidos (`isomorphic-dompurify`), sin scripts ni manejadores de eventos.
- El CSS se procesa con PostCSS: se prefijan los selectores con el id del perfil, se bloquea `@import`, se restringen las URLs de `url()` y se limita `position: fixed` y `z-index`.
- El perfil se muestra en un `<iframe>` servido por una ruta aparte con el header `Content-Security-Policy: sandbox`, para que el contenido del usuario no pueda tocar la sesión ni la interfaz de la app.
- La música se agrega solo con embeds de una lista de proveedores permitidos, nunca con HTML arbitrario.

**Tema con variables CSS:** los colores de la interfaz salen de variables (`--accent-1`, `--accent-2`, etc.) definidas en `globals.css`, así cada perfil puede cambiarlas sin tocar los componentes.

## Stack

| Hoy | Próximamente |
| --- | --- |
| Next.js (App Router) | Auth.js |
| TypeScript | Drizzle ORM |
| Tailwind CSS | Neon (Postgres) |
| Vercel | Zod, Vitest |

## Cómo correrlo

```bash
git clone https://github.com/TU_USUARIO/orbita.git
cd orbita
npm install
npm run dev
```

Abrí http://localhost:3000. Por ahora no hace falta ninguna variable de entorno.

## Estructura

```
src/
  app/                    Rutas, layout y estilos globales
  components/profile/     Componentes de la pantalla de perfil
  data/demo-profile.ts    Datos de ejemplo
  lib/                    Utilidades y presets de tema
  types/                  Tipos de TypeScript (Profile, Track, Friend...)
design/
  orbita-perfil.html      Mockup original del diseño
```

## Autor

Hecho por [Gab <3](https://github.com/GabrielaLescano).