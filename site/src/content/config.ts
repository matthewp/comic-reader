import { defineCollection, z } from 'astro:content';

const pages = defineCollection({
  schema: z.object({
    title: z.string(),
    id: z.string().optional(),
    shortTitle: z.string().optional(),
    preloadImage: z.array(z.string()).optional()
  })
});

export const collections = {
  pages
};