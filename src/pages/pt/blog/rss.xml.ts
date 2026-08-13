import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const AUTHOR_EMAIL = 'cargabsj175@gmail.com';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ slug }) => slug.startsWith('pt/'));
  posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return rss({
    title: 'Blog do Neonatox',
    description: 'Notícias, guias e reflexões sobre o Neonatox.',
    site: context.site!,
    customData: '<language>pt-br</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      author: `${AUTHOR_EMAIL} (${post.data.author})`,
      link: `pt/blog/${post.slug.replace('pt/', '')}/`,
    })),
  });
}
