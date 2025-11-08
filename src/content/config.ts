import { z, defineCollection } from "astro:content";

const postsCollection = defineCollection({
    type: 'content',
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
