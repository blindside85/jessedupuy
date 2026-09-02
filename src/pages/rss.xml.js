import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const posts = await getCollection("posts", ({ data }) => {
        // Never include drafts in RSS feed
        return !data.draft;
    });
    return rss({
        title: 'jessedupuy: writing',
        description: 'My little chunk of the internet',
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/posts/${post.id}/`,
        })),
        customData: `<language>en-us</language>`,
    });
}
