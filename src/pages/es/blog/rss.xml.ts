import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import {
  getAllPosts,
  getBlogPostPath,
  getLocaleFromSlug,
  getSlugFromSlug,
} from '../../../utils/blog';

const AUTHOR_EMAIL = 'cargabsj175@gmail.com';

export async function GET(context: APIContext) {
  const posts = (await getAllPosts()).filter(
    (post) => getLocaleFromSlug(post.slug) === 'es'
  );

  return rss({
    title: 'Blog de Neonatox',
    description: 'Noticias, guías y reflexiones sobre Neonatox.',
    site: context.site!,
    customData: '<language>es</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: `${AUTHOR_EMAIL} (${post.data.author})`,
      link: getBlogPostPath('es', getSlugFromSlug(post.slug)),
      categories: post.data.tags ?? [],
    })),
  });
}
