import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const postsCollection = defineCollection({
    loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/posts" }),
    schema: z.object({
        title: z.string(),
        pubDate: z.date(),
        description: z.string(),
        author: z.string(),
        image: z.object({
            url: z.string().optional(),
            alt: z.string().optional()
        }).optional(),
        tags: z.array(z.string()),
        draft: z.boolean().optional().default(false)
    })
});

export const collections = {
    posts: postsCollection,
};
