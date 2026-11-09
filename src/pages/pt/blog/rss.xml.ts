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
    (post) => getLocaleFromSlug(post.slug) === 'pt'
  );

  return rss({
    title: 'Blog do Neonatox',
    description: 'Notícias, guias e reflexões sobre o Neonatox.',
    site: context.site!,
    customData: '<language>pt</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: `${AUTHOR_EMAIL} (${post.data.author})`,
      link: getBlogPostPath('pt', getSlugFromSlug(post.slug)),
      categories: post.data.tags ?? [],
    })),
  });
}
