import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";
import { icons } from "./lib/icons";

const iconName = z.enum(Object.keys(icons) as [keyof typeof icons, ...(keyof typeof icons)[]]);

/** Services shown in the grid, the form checkboxes and the care-plan builder. */
const services = defineCollection({
  loader: file("src/content/services.json"),
  schema: z.object({
    title: z.string(),
    icon: iconName,
    summary: z.string(),
    order: z.number(),
    /** false = offered (form, care-plan builder) but not shown as a card. */
    inGrid: z.boolean().default(true),
  }),
});

const faqs = defineCollection({
  loader: file("src/content/faqs.json"),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    order: z.number(),
  }),
});

/**
 * Testimonials. `placeholder: true` marks design samples that MUST be replaced
 * with real, permission-granted reviews before launch (FTC rule on fake reviews).
 */
const testimonials = defineCollection({
  loader: file("src/content/testimonials.json"),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    relation: z.string(),
    rating: z.number().int().min(1).max(5).default(5),
    placeholder: z.boolean().default(false),
    order: z.number(),
  }),
});

export const collections = { services, faqs, testimonials };
