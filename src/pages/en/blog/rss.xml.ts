import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const AUTHOR_EMAIL = 'cargabsj175@gmail.com';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ slug }) => slug.startsWith('en/'));
  posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

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
      link: `en/blog/${post.slug.replace('en/', '')}/`,
    })),
  });
}
