import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Helpers del blog de Neonatox.
 *
 * Adaptado del blog del portafolio (cargabsj175.github.io) a las diferencias
 * de este repo:
 * - Astro 5 con Content Collections legacy: el identificador es `post.slug`
 *   (`es/mi-post`) y el renderizado es `await post.render()`.
 * - `prefixDefaultLocale: true`: TODAS las rutas llevan prefijo de idioma,
 *   incluido el locale por defecto (`/es/blog/`).
 */

export const LOCALES = ['es', 'en', 'pt'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

export type BlogPost = CollectionEntry<'blog'>;

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Colecciones legacy: el slug es `es/mi-post`, así que el primer segmento
 * es el idioma.
 */
export function getLocaleFromSlug(slug: string): Locale {
  const [prefix] = slug.split('/');
  return isLocale(prefix) ? prefix : DEFAULT_LOCALE;
}

export function getSlugFromSlug(slug: string): string {
  return slug.split('/').slice(1).join('/');
}

// ---------------------------------------------------------------------------
// Rutas (siempre con prefijo de idioma y barra final)
// ---------------------------------------------------------------------------

export function getBlogPath(locale: Locale): string {
  return `/${locale}/blog/`;
}

export function getBlogPostPath(locale: Locale, slug: string): string {
  return `/${locale}/blog/${slug}/`;
}

export function getRssPath(locale: Locale): string {
  return `/${locale}/blog/rss.xml`;
}

/** Slug de etiqueta: minúsculas, sin acentos y espacios → '-'. */
export function getTagSlug(tag: string): string {
  return normalizeText(tag)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTagPath(locale: Locale, tag: string): string {
  return `/${locale}/blog/tag/${getTagSlug(tag)}/`;
}

// ---------------------------------------------------------------------------
// Formato y utilidades de texto
// ---------------------------------------------------------------------------

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Minúsculas y sin acentos, para que la búsqueda funcione con o sin diacríticos. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Tiempo de lectura aproximado, ~200 palabras por minuto. */
export function getReadingTime(body?: string): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ---------------------------------------------------------------------------
// Consultas sobre la colección
// ---------------------------------------------------------------------------

/** Oculta borradores en producción (en dev/preview siguen visibles). */
export function isPublished(post: BlogPost): boolean {
  return !post.data.draft || !import.meta.env.PROD;
}

export function sortByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', isPublished);
  return sortByDateDesc(posts);
}

export async function getPostsByLocale(locale: Locale): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => getLocaleFromSlug(post.slug) === locale);
}

/** Mapa locale → post con todas las traducciones existentes del mismo slug. */
export function getTranslations(
  post: BlogPost,
  allPosts: BlogPost[]
): Partial<Record<Locale, BlogPost>> {
  const slug = getSlugFromSlug(post.slug);
  const translations: Partial<Record<Locale, BlogPost>> = {};

  for (const candidate of allPosts) {
    if (getSlugFromSlug(candidate.slug) !== slug) continue;
    translations[getLocaleFromSlug(candidate.slug)] = candidate;
  }

  return translations;
}

/**
 * Enlaces del selector de idioma de un post: la traducción si existe,
 * y si no, el índice del blog de ese idioma.
 */
export function getPostLanguageLinks(
  post: BlogPost,
  allPosts: BlogPost[]
): Record<Locale, string> {
  const translations = getTranslations(post, allPosts);
  const links = {} as Record<Locale, string>;

  for (const locale of LOCALES) {
    const translation = translations[locale];
    links[locale] = translation
      ? getBlogPostPath(locale, getSlugFromSlug(translation.slug))
      : getBlogPath(locale);
  }

  return links;
}

export function getAdjacentPosts(
  post: BlogPost,
  posts: BlogPost[]
): { older?: BlogPost; newer?: BlogPost } {
  const sorted = sortByDateDesc(posts);
  const index = sorted.findIndex((candidate) => candidate.slug === post.slug);
  if (index === -1) return {};
  return {
    newer: index > 0 ? sorted[index - 1] : undefined,
    older: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  };
}

/**
 * Posts de otros idiomas que no tienen traducción en `locale`.
 * Sirve para avisar al lector de que hay artículos solo en otro idioma.
 */
export function getPostsOnlyInOtherLocales(
  locale: Locale,
  allPosts: BlogPost[]
): Array<{ locale: Locale; posts: BlogPost[] }> {
  const currentSlugs = new Set(
    allPosts
      .filter((post) => getLocaleFromSlug(post.slug) === locale)
      .map((post) => getSlugFromSlug(post.slug))
  );

  return LOCALES.filter((candidate) => candidate !== locale)
    .map((candidate) => ({
      locale: candidate,
      posts: allPosts.filter(
        (post) =>
          getLocaleFromSlug(post.slug) === candidate &&
          !currentSlugs.has(getSlugFromSlug(post.slug))
      ),
    }))
    .filter((entry) => entry.posts.length > 0);
}

/**
 * Posts relacionados: mismo idioma, distinto slug y con etiquetas
 * compartidas; ordenados por etiquetas comunes y luego por fecha.
 */
export function getRelatedPosts(
  post: BlogPost,
  allPosts: BlogPost[],
  limit = 3
): BlogPost[] {
  const locale = getLocaleFromSlug(post.slug);
  const slug = getSlugFromSlug(post.slug);
  const tags = new Set((post.data.tags ?? []).map(normalizeText));

  return allPosts
    .filter(
      (candidate) =>
        getLocaleFromSlug(candidate.slug) === locale &&
        getSlugFromSlug(candidate.slug) !== slug
    )
    .map((candidate) => ({
      post: candidate,
      shared: (candidate.data.tags ?? []).filter((tag) =>
        tags.has(normalizeText(tag))
      ).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime()
    )
    .slice(0, limit)
    .map((entry) => entry.post);
}
