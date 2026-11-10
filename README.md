# EverLove Homecare website

Marketing site for **EverLove Homecare LLC**, published at [everlovehomecarellc.com](https://everlovehomecarellc.com).

- **Framework:** [Astro](https://astro.build), with strict TypeScript. Pages are built ahead of time as static HTML, and only the interactive parts load JavaScript.
- **Styling:** each component has its own scoped CSS. Shared colours, fonts and spacing are set as variables in `src/styles/global.css`.
- **Content:** services, FAQs and testimonials live in JSON files, and Zod checks them against a schema at build time.
- **Contact form:** an API route at `src/pages/api/contact.ts` runs as a Netlify Function and sends each enquiry by email through [Resend](https://resend.com).
- **Hosting:** Netlify. The domain stays registered at WhoGoHost; only its DNS points to Netlify.

## Getting started

```bash
nvm use            # Node 24 (see .nvmrc)
npm install
cp .env.example .env   # add RESEND_API_KEY to test the form locally
npm run dev            # http://localhost:4321
```

| Script            | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Starts the local dev server with hot reload    |
| `npm run build`   | Type-checks (`astro check`), then builds to `dist/` |
| `npm run preview` | Serves the production build locally            |

## Project structure

```
src/
  assets/brand/        Logo files (transparent PNGs, generated from the client's logo)
  assets/photos/       Drop hero.jpg / about.jpg / careers.jpg here (see below)
  components/          One component per page section, each with its own scoped CSS
  content/*.json       Services, FAQs, testimonials (schemas in src/content.config.ts)
  layouts/             BaseLayout: <head>, SEO, structured data, fonts
  lib/site.ts          Phone, email, domain, tagline: the single source of truth
  lib/careFinder.ts    Rules for the care-plan builder
  pages/               index, privacy, 404, api/contact
public/                favicon, social-share image, robots.txt, manifest
```

## Editing content

- **Phone, email or tagline:** edit `src/lib/site.ts`. The change applies everywhere on the site.
- **Services, FAQs, testimonials:** edit the JSON files in `src/content/`. The build fails with a clear error if an entry breaks its schema.
- **Photos:** add `hero.jpg`, `about.jpg` and/or `careers.jpg` to `src/assets/photos/`. Each one is detected automatically, resized and served as WebP. Until a photo is added, that spot shows a branded placeholder.
  - `hero`: portrait, about 4:5 (shown in an arch-shaped frame)
  - `about`: square
  - `careers`: portrait, about 4:5

## Deploying to Netlify

1. In Netlify, choose **Add new site → Import from Git**, then pick this repo. Netlify reads the build settings from `netlify.toml`.
2. Under **Site settings → Environment variables**, add:
   - `RESEND_API_KEY`: from resend.com → API Keys
   - `CONTACT_TO_EMAIL`: where enquiries go (defaults to everlovehomecarellc@gmail.com)
   - `CONTACT_FROM_EMAIL`: see the Resend section below
3. Every push to `main` deploys to production, and every other branch or PR gets its own preview URL.

### Pointing the WhoGoHost domain to Netlify

1. In Netlify, go to **Domain management → Add a domain** and enter `everlovehomecarellc.com`.
2. In WhoGoHost's DNS manager for the domain, set:
   - an `A` record for `@` pointing to `75.2.60.5` (Netlify's load balancer)
   - a `CNAME` record for `www` pointing to `<your-site>.netlify.app`
3. Back in Netlify, choose **HTTPS → Verify DNS** and let it provision the Let's Encrypt certificate.

Check Netlify's DNS screen for the current values; it shows exactly what to enter.

### Email with Resend

- The free tier covers 3,000 emails a month, which is plenty for a contact form.
- Until the domain is verified, keep `CONTACT_FROM_EMAIL="EverLove Website <onboarding@resend.dev>"`. While it's unverified, Resend only delivers to the email address of the Resend account owner, so create the Resend account with **everlovehomecarellc@gmail.com**.
- To verify the domain, open Resend → **Domains → Add**, then add the DNS records it lists in WhoGoHost. After that, set `CONTACT_FROM_EMAIL="EverLove Website <website@everlovehomecarellc.com>"`.

## Pre-launch checklist

- [ ] Replace the placeholder testimonials in `src/content/testimonials.json` with real reviews the clients have agreed to publish, then remove `"placeholder": true`. Until then the build prints a warning.
- [ ] Get real photos of the client's team (with consent).
- [ ] Confirm the wording of these claims with the client: "24/7 care", "free consultation", "background-checked", "non-medical care", and the FAQ answers about payment and timing.
- [ ] Add the service area or city, which helps local SEO.
- [ ] Have the privacy policy reviewed.
- [ ] Add social media URLs in `src/lib/site.ts`.
- [ ] Set up a Google Business Profile and link it to the site.
