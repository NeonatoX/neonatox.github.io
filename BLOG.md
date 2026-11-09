# Blog

El blog usa **Astro Content Collections (API legacy de Astro 5)**: cada artículo es un archivo Markdown dentro de `src/content/blog/`. Los helpers viven en `src/utils/blog.ts` y los textos en `src/utils/i18n.ts` (clave `blog`).

> Para el tutorial de sintaxis Markdown (código, imágenes, tablas, videos), mira también `BLOG-TUTORIAL.md`. Este archivo es la guía de referencia del sistema del blog.

## Estructura

```
src/content/blog/
├── es/<slug>.md
├── en/<slug>.md
└── pt/<slug>.md
```

- Todas las rutas llevan prefijo de idioma (`prefixDefaultLocale: true`): no existe `/blog/` en la raíz.
- El nombre del archivo es el slug de la URL: `mi-articulo.md` → `/es/blog/mi-articulo/`, `/en/blog/mi-articulo/`, `/pt/blog/mi-articulo/`.
- Un artículo puede existir en **uno o varios idiomas**. No es obligatorio traducirlo a los tres.
- Para que el selector de idioma y los enlaces `hreflang` conecten las traducciones, usa el **mismo nombre de archivo** en los idiomas que existan.
- Si un artículo no tiene traducción, el selector de idioma enlaza al índice del blog de ese idioma, y el índice avisa de que hay artículos solo en otros idiomas.

## Frontmatter

```yaml
---
title: "Título del artículo"
description: "Resumen breve para la lista del blog y las meta etiquetas."
pubDate: 2026-11-09
lang: es
author: "Carlos Sánchez"                # opcional
tags: ["neonatox", "linux"]              # opcional
cover: "/blog/mi-articulo/portada.webp"  # opcional
coverAlt: "Descripción de la portada"    # opcional
updatedDate: 2026-11-15                  # opcional
draft: false                             # opcional
legacyUrl: "https://blog-anterior.com/mi-articulo/" # opcional
---
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `title` | Sí | Título del artículo. |
| `description` | Sí | Resumen corto para SEO y listados. |
| `pubDate` | Sí | Fecha de publicación (`YYYY-MM-DD`). |
| `lang` | Sí | `es`, `en` o `pt`. Debe coincidir con la carpeta. |
| `author` | No | Por defecto, `Carlos Sánchez`. |
| `tags` | No | Etiquetas para el buscador y los filtros. Por defecto, `[]`. |
| `cover` | No | Imagen destacada. Ruta en `public/` o URL absoluta. |
| `coverAlt` | No | Texto alternativo de la portada. |
| `updatedDate` | No | Fecha de última actualización (se muestra y va al JSON-LD). |
| `draft` | No | Si es `true`, no se publica en producción (en dev sí se ve). |
| `legacyUrl` | No | URL original del artículo (para futuras migraciones/redirecciones). |

## Crear un artículo

1. Crea el archivo en la carpeta del idioma:

   ```bash
   touch src/content/blog/es/mi-articulo.md
   ```

2. Añade el frontmatter y el contenido.
3. Ejecuta `npm run dev` y abre `http://localhost:4321/es/blog/mi-articulo/`.
4. Comprueba que aparece en `/es/blog/`.

## Qué incluye cada artículo

El layout (`src/layouts/BlogLayout.astro`) añade automáticamente:

- **TOC** con los `h2`/`h3` (versión colapsable en móvil, sticky en escritorio, con scrollspy).
- **Tiempo de lectura** (~200 palabras/minuto) y fecha de actualización.
- **Etiquetas enlazadas** a su página de etiqueta.
- **Enlaces de traducción** ("También disponible en") si existen.
- **Anterior/siguiente** y **artículos relacionados** por etiquetas compartidas.
- **JSON-LD `Article`**, canonical, `hreflang` + `x-default` y Open Graph/Twitter.
- **Comentarios** vía Giscus (`CommentSection.astro`).

## Buscador y etiquetas

- El índice de cada idioma incluye un buscador en el cliente que filtra por título, descripción y etiquetas. Es insensible a mayúsculas y acentos (buscar "glibc" encuentra "glibc" y "Bienvenido" encuentra "bienvenido").
- Cada etiqueta tiene ruta estática propia: `/es/blog/tag/neonatox/` (slug en minúsculas, sin acentos y espacios → `-`).
- También funciona el filtro por query string para compatibilidad: `/es/blog/?tag=Neonatox`.
- El conteo de resultados usa plural correcto (`Intl.PluralRules`).
- Sin dependencias externas de JavaScript: todo es un script inline pequeño.

## RSS y sitemap

- RSS por idioma: `/es/blog/rss.xml`, `/en/blog/rss.xml`, `/pt/blog/rss.xml` (con categorías = etiquetas y autor).
- Sitemap: `/sitemap-index.xml` (generado por `@astrojs/sitemap` con i18n; la raíz `/` se excluye porque es solo un redirect).
- `robots.txt` apunta al sitemap.

## Notas para el agente

- **No migres** a la Content Layer API de Astro 6: este repo usa `post.slug` y `await post.render()`.
- **No añadas** `@tailwindcss/typography`: los estilos de prosa van con clases arbitrarias en `BlogLayout.astro`.
- Dentro de `getStaticPaths` usa literales (`'es'`, `'en'`, `'pt'`), no constantes de nivel superior (limitación de Astro).
- Textos nuevos del blog → objeto `blog` en los tres idiomas de `src/utils/i18n.ts`.
- Al añadir un idioma: carpeta `src/content/blog/<lang>/`, página de índice, `[...slug]`, `tag/[tag]`, `rss.xml.ts` y entradas en `LOCALES` (utils/blog.ts) y en `astro.config.mjs`.

## Comandos

```bash
npm run dev       # Desarrollo en localhost:4321
npm run build     # Genera dist/
npm run preview   # Previsualiza la build
```
