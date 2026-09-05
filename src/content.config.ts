import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const isoDate = z.union([
  z.iso.date(),
  z.date().transform((date) => date.toISOString().slice(0, 10)),
]);

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    region: z.enum(['niigata']),
    category: z.enum(['housing', 'food', 'work', 'support', 'mobility', 'run']),
    status: z.enum(['verified', 'observation', 'draft']),
    publishedAt: isoDate,
    updatedAt: isoDate,
    verifiedAt: isoDate.optional(),
    sources: z
      .array(
        z.object({
          title: z.string().min(1),
          url: z.url(),
          accessedAt: isoDate,
        }),
      )
      .default([]),
    featured: z.boolean().default(false),
  }),
});

export const collections = { guides };
