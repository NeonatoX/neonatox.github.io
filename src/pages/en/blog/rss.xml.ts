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
    (post) => getLocaleFromSlug(post.slug) === 'en'
  );

  return rss({
    title: 'Neonatox Blog',
    description: 'News, guides and thoughts about Neonatox.',
    site: context.site!,
    customData: '<language>en</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: `${AUTHOR_EMAIL} (${post.data.author})`,
      link: getBlogPostPath('en', getSlugFromSlug(post.slug)),
      categories: post.data.tags ?? [],
    })),
  });
}
