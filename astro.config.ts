import { defineConfig, envField } from "astro/config";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";

// The site's public URL, used for canonical links, social previews and the sitemap.
// On Netlify, `URL` is the site's main address: the *.netlify.app one until the custom
// domain is added, then the domain. Override with SITE_URL if ever needed.
const siteUrl = process.env.SITE_URL || process.env.URL || "https://everlovehomecarellc.com";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: siteUrl,
  // Pages are prerendered to static HTML; only routes with `prerender = false`
  // (the contact form API) run as Netlify Functions.
  output: "static",
  adapter: netlify({
    // The site has no Edge Functions, so skip their local (Deno-based) emulation;
    // it fails to start with the Deno version Netlify's tooling downloads.
    devFeatures: { edgeFunctions: false, images: true, environmentVariables: false },
  }),
  integrations: [sitemap()],
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
      CONTACT_TO_EMAIL: envField.string({
        context: "server",
        access: "secret",
        default: "everlovehomecarellc@gmail.com",
      }),
      CONTACT_FROM_EMAIL: envField.string({
        context: "server",
        access: "secret",
        // Only the address is used: the display name is set per email
        // ("EverLove Website" for the team, "EverLove Homecare" for customers).
        default: "EverLove Homecare <onboarding@resend.dev>",
      }),
    },
  },
});
