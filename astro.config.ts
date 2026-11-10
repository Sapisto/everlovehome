import { defineConfig, envField } from "astro/config";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://everlovehomecarellc.com",
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
        default: "EverLove Website <onboarding@resend.dev>",
      }),
    },
  },
});
