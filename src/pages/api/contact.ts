import type { APIRoute } from "astro";
import { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from "astro:env/server";
import { contactSchema, type ContactInput, type ContactResponse } from "@/lib/contact";

// Runs as a Netlify Function; everything else on the site is static.
export const prerender = false;

const json = (body: ContactResponse, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function renderEmail(d: ContactInput) {
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Phone", d.phone],
    ["Email", d.email || "(not provided)"],
    ["Care is for", d.relationship || "(not specified)"],
    ["Services", d.services.length ? d.services.join(", ") : "(none selected)"],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", "Message:", d.message || "(no message)"].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#22152e">
      <h2 style="color:#4f1a74;margin:0 0 16px">New care enquiry from the website</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px 12px;background:#f4ecfa;font-weight:bold;width:130px">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #ebe1f2">${escape(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <h3 style="color:#4f1a74;margin:20px 0 8px">Message</h3>
      <p style="white-space:pre-wrap;background:#faf6fd;padding:12px;border-radius:8px">${escape(d.message || "(no message)")}</p>
      <p style="margin-top:20px"><a href="tel:${escape(d.phone.replace(/[^0-9+]/g, ""))}" style="background:#6b1f93;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Call ${escape(d.name)}</a></p>
    </div>`;
  return { text, html };
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

  const { text, html } = renderEmail(data);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: data.email || undefined,
      subject: `New care enquiry: ${data.name}${data.services.length ? ` (${data.services.join(", ")})` : ""}`,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend error", res.status, await res.text());
    return json({ ok: false, error: "We couldn't send your message." }, 502);
  }
  return json({ ok: true });
};
