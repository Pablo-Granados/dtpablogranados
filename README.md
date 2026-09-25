# pablogranados.com

Sitio personal de Pablo Granados: análisis de fútbol y futsal, mentoría **Sistema Propio**, servicios para equipos y proyectos.

## Stack

- **Astro 7** + TypeScript (HTML estático, casi sin JS)
- **Tailwind CSS 4** (tokens en `src/styles/global.css`)
- Fuentes self-hosted: Archivo (display condensada), Inter (texto), JetBrains Mono (datos)
- **Umami** para analytics (eventos por `data-umami-event`, sin JS propio)
- Sitemap automático


## Estructura

```
src/
  data/site.ts          ← TODO el texto y los datos (stats, proyectos, CTAs, videos)
  styles/global.css     ← tokens de color, tipografía y utilidades (.display, .tag, .frame)
  layouts/Base.astro    ← SEO, Open Graph, JSON-LD, Umami
  components/
    ui/                 ← Button, SectionHeader, Media, YouTube (reutilizables)
    home/               ← secciones de la Home
    Header / Footer
  scripts/reveal.ts     ← animaciones al entrar en pantalla
public/                 ← favicon, og-default.png y tus capturas/videos
```

## Cómo cargar material real

- **Capturas / videos:** poné los archivos en `public/media/` y completá `media.src` de cada proyecto en `src/data/site.ts` (ej. `src: '/media/futsalhub.webp'`). Mientras no haya `src`, se muestra un marcador que indica qué va ahí.
- **Videos de YouTube:** completá `id` en `featuredVideos` (la parte después de `watch?v=`).
- **Foto de "Sobre mí":** agregá `src` al `<Media>` en `src/components/home/About.astro`.

## Eventos de Umami

| Evento | Dónde |
|---|---|
| `intencion_select` (tipo) | Selector del hero |
| `cta_mentoria`, `cta_aplicar`, `cta_diagnostico`, `cta_propuesta`, `cta_proyecto`, `cta_proyectos`, `cta_caso` | Botones (con `ubicacion`) |
| `out_youtube`, `out_instagram`, `out_linkedin`, `out_futsal-hub`, `out_laa-sports` | Links salientes |
| `video_play` (id) | Reproducción de videos |

## Deploy

Vercel: importar el repo, framework "Astro", variables de entorno de `.env.example`. Cambiar `SITE_URL` en `astro.config.mjs` cuando esté el dominio definitivo.
