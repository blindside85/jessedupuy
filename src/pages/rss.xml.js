import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
    const currSite = context.site || 'https://jessedupuy.me';
    return rss({
        title: 'jessedupuy: blog',
        description: 'My little chunk of the internet',
        site: currSite,
        items: await pagesGlobToRssItems(
            import.meta.glob('./**/*.{md,mdx}')
        ),
        customData: `<language>en-us</language>`,
    });
}
