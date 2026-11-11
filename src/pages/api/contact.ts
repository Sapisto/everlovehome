import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from "astro:env/server";
import { contactSchema, type ContactResponse } from "@/lib/contact";
import { confirmationEmail, notificationEmail, type Email } from "@/lib/emails";
import { site } from "@/lib/site";

// Runs as a Netlify Function; everything else on the site is static.
export const prerender = false;

const json = (body: ContactResponse, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** The bare address from CONTACT_FROM_EMAIL ("Name <addr>" or just "addr"). */
const fromAddress = CONTACT_FROM_EMAIL.match(/<([^>]+)>/)?.[1] ?? CONTACT_FROM_EMAIL.trim();

async function send(email: Email & { from: string; to: string; replyTo?: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: email.from,
      to: [email.to],
      reply_to: email.replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  if (!res.ok) console.error("[contact] Resend error", res.status, email.to, await res.text());
  return res.ok;
}

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }, 422);
  }
  const data = parsed.data;

  // Bots fill hidden fields: pretend success, send nothing.
  if (data.website) return json({ ok: true });

  if (!RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY is not set; enquiry not sent:", data.name, data.phone);
    return json({ ok: false, error: "Our form is temporarily unavailable." }, 503);
  }

  // Images in emails need a public URL: use the deployed host (production or a
  // Netlify preview), but fall back to the live domain when running locally.
  const origin = new URL(request.url).origin;
  const assetBase = /localhost|127\.0\.0\.1/.test(origin) ? site.url : origin;

  // 1. Tell the EverLove team. This is the one that must succeed.
  const delivered = await send({
    ...notificationEmail(data, { assetBase }),
    from: `EverLove Website <${fromAddress}>`,
    to: CONTACT_TO_EMAIL,
    replyTo: data.email || undefined,
  });
  if (!delivered) return json({ ok: false, error: "We couldn't send your message." }, 502);

  // 2. Thank the person who booked. A failure here is logged but not shown to
  //    them: their request already reached the team.
  if (data.email) {
    const knownServices = (await getCollection("services")).map((s) => s.data.title);
    await send({
      ...confirmationEmail(data, { assetBase, knownServices }),
      from: `EverLove Homecare <${fromAddress}>`,
      to: data.email,
      replyTo: CONTACT_TO_EMAIL,
    });
  }

  return json({ ok: true });
};
