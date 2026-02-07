import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .filter((post) => post.data.published)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: 'phucle.dev',
    description: 'Blog công nghệ - Chia sẻ kiến thức và kinh nghiệm lập trình',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/${post.data.slug ?? post.slug}/`,
    })),
  });
}
