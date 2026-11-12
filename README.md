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
  lib/site.ts          Phone, email, domain, tagline, service areas: the single source of truth
  lib/story.ts         About, Vision, Mission, Core Values, Promise (the client's own words)
  lib/careFinder.ts    Rules for the care-plan builder
  pages/               index, privacy, 404, api/contact
public/                favicon, social-share image, robots.txt, manifest
```

## Editing content

- **Phone, email or tagline:** edit `src/lib/site.ts`. The change applies everywhere on the site.
- **About, Vision, Mission, Core Values and Promise:** edit `src/lib/story.ts`.
- **Service areas (counties):** edit `serviceAreas` in `src/lib/site.ts`. They appear in the Services section, contact details, footer and search-engine data.
- **Testimonials:** entries marked `"placeholder": true` are never shown. The section appears automatically once a real, permission-granted review is added without that flag.
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

Each form submission sends two emails (templates in `src/lib/emails.ts`):

1. **To the team** (`CONTACT_TO_EMAIL`): every detail of the request, with "Call" and "Reply by email" buttons. Replying goes straight to the customer.
2. **To the customer**, if they gave an email: a branded "we've received your request" confirmation explaining what happens next. Replying goes to `CONTACT_TO_EMAIL`. The team email is sent first; if only the confirmation fails, the error is logged and the customer still sees the success message.

- The free tier covers 3,000 emails a month, which is plenty for a contact form.
- **The domain must be verified before launch.** Until it is, the sender is `onboarding@resend.dev`, and Resend only delivers to the Resend account owner's own inbox. Emails to the client's Gmail and confirmations to customers are rejected.
- To verify the domain, open Resend → **Domains → Add**, then add the DNS records it lists (SPF, DKIM, MX) in WhoGoHost. Once Resend shows it as verified, set `CONTACT_FROM_EMAIL="EverLove Homecare <hello@everlovehomecarellc.com>"` in Netlify and redeploy. Only the address part is used; the display name is set for each email.

## Pre-launch checklist

- [ ] Replace the placeholder testimonials in `src/content/testimonials.json` with real reviews the clients have agreed to publish, then remove `"placeholder": true`. Until then the Testimonials section stays hidden.
- [ ] Get real photos of the client's team (with consent).
- [ ] Confirm the wording of these claims with the client: "24/7 care", "free consultation", "background-checked", "non-medical care", and the FAQ answers about payment and timing.
- [ ] Have the privacy policy reviewed.
- [ ] Add social media URLs in `src/lib/site.ts`.
- [ ] Set up a Google Business Profile and link it to the site.
