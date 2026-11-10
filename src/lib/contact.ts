import { z } from "astro/zod";

/** Shared validation for the contact form (used by the API route). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number.")
    .max(30)
    .regex(/^[0-9+().\-\s]+$/, "Please enter a valid phone number."),
  email: z.union([z.literal(""), z.email("Please enter a valid email.").max(200)]).default(""),
  relationship: z.string().trim().max(50).default(""),
  services: z.array(z.string().trim().max(60)).max(12).default([]),
  message: z.string().trim().max(3000).default(""),
  /** Honeypot: real users never fill this in. */
  website: z.string().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export interface ContactResponse {
  ok: boolean;
  error?: string;
}
