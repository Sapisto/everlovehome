/**
 * HTML + plain-text emails sent by the contact form (see src/pages/api/contact.ts).
 *
 * Email clients (Gmail, Outlook, Apple Mail…) ignore most modern CSS, so these use
 * table layout and inline styles only. Colours mirror the tokens in src/styles/global.css.
 */
import type { ContactInput } from "./contact";
import { site } from "./site";

const C = {
  plum900: "#2a0f3f",
  plum800: "#3b1458",
  plum700: "#4f1a74",
  brand: "#6b1f93",
  orchid: "#9a4fc8",
  lilac300: "#d9c2ec",
  lilac200: "#e9dbf5",
  lilac100: "#f4ecfa",
  lilac50: "#faf6fd",
  cream: "#fdfaf6",
  gold: "#c8963e",
  gold600: "#ad7d2c",
  gold100: "#f6ead3",
  ink: "#22152e",
  muted: "#5d4f69",
  line: "#ebe1f2",
};
const SERIF = "Georgia, 'Times New Roman', Times, serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export interface Email {
  subject: string;
  html: string;
  text: string;
}

export const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, "")}`;

/**
 * First name for greetings. Only letters, apostrophes and hyphens survive, so the
 * form can't be used to put links or other text into an email sent to a stranger.
 */
export function firstName(name: string): string {
  const first = (name.trim().split(/\s+/)[0] ?? "").replace(/[^\p{L}'’-]/gu, "").slice(0, 30);
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : "";
}

/* ---------- Building blocks ---------- */

function button(href: string, label: string, variant: "primary" | "ghost" = "primary") {
  const primary = variant === "primary";
  const bg = primary ? C.plum700 : "#ffffff";
  const fg = primary ? "#ffffff" : C.plum700;
  const border = primary ? C.plum700 : C.lilac300;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:6px 4px">
    <tr><td align="center" bgcolor="${bg}" style="border-radius:999px;border:2px solid ${border};${primary ? `background:${C.plum700};background-image:linear-gradient(135deg,${C.brand},${C.plum800});` : ""}">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${SANS};font-size:15px;font-weight:700;line-height:1.2;color:${fg};text-decoration:none;border-radius:999px">${label}</a>
    </td></tr></table>`;
}

const chips = (items: string[]) =>
  items
    .map(
      (s) =>
        `<span style="display:inline-block;white-space:nowrap;margin:0 6px 6px 0;padding:6px 13px;border-radius:999px;background:${C.lilac100};border:1px solid ${C.lilac200};color:${C.plum700};font-family:${SANS};font-size:13px;font-weight:600;line-height:1.3">${escape(s)}</span>`,
    )
    .join("");

const eyebrow = (text: string) =>
  `<p style="margin:0 0 10px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${C.gold600}">${text}</p>`;

const p = (html: string, extra = "") =>
  `<p style="margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:1.65;color:${C.ink};${extra}">${html}</p>`;

const h2 = (text: string) =>
  `<h2 style="margin:0 0 14px;font-family:${SERIF};font-size:20px;line-height:1.3;font-weight:normal;color:${C.plum900}">${text}</h2>`;

/** Rounded, tinted panel. */
const panel = (inner: string, bg = C.lilac50, border = C.line) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px">
    <tr><td class="panel" style="background:${bg};border:1px solid ${border};border-radius:18px;padding:22px 24px">${inner}</td></tr></table>`;

/** Label / value rows. Values must already be escaped. */
const detailRows = (rows: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows
    .map(
      ([k, v], i) =>
        `<tr>
          <td class="lbl" valign="top" style="padding:10px 12px 10px 0;width:120px;font-family:${SANS};font-size:13px;font-weight:700;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ""}">${k}</td>
          <td valign="top" style="padding:10px 0;font-family:${SANS};font-size:15px;line-height:1.5;color:${C.ink};${i ? `border-top:1px solid ${C.line};` : ""}">${v}</td>
        </tr>`,
    )
    .join("")}</table>`;

function steps(items: { title: string; text: string }[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px">${items
    .map(
      (s, i) => `<tr>
        <td valign="top" width="52" style="padding:0 0 18px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" valign="middle" width="38" height="38" bgcolor="${C.lilac100}" style="width:38px;height:38px;border-radius:50%;background:${C.lilac100};border:1px solid ${C.lilac300};font-family:${SERIF};font-size:17px;color:${C.brand}">${i + 1}</td>
          </tr></table>
        </td>
        <td valign="top" style="padding:2px 0 18px">
          <p style="margin:0 0 3px;font-family:${SANS};font-size:16px;font-weight:700;color:${C.plum900}">${s.title}</p>
          <p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted}">${s.text}</p>
        </td>
      </tr>`,
    )
    .join("")}</table>`;
}

/* ---------- Page shell ---------- */

function layout(opts: { title: string; preheader: string; assetBase: string; body: string; footer: string }) {
  const { title, preheader, assetBase, body, footer } = opts;
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escape(title)}</title>
  <style>
    @media (max-width: 620px) {
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .h1 { font-size: 26px !important; }
      .panel { padding: 16px 16px !important; }
      .lbl { width: 84px !important; }
    }
    a { color: ${C.brand}; }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.lilac100};-webkit-text-size-adjust:100%">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${escape(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.lilac100}" style="background:${C.lilac100}">
    <tr><td align="center" style="padding:32px 12px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

        <!-- Header -->
        <tr><td align="center" bgcolor="${C.plum700}" style="background:${C.plum700};background-image:linear-gradient(135deg,${C.brand} 0%,${C.plum800} 100%);border-radius:24px 24px 0 0;padding:34px 24px 30px">
          <a href="${site.url}" style="text-decoration:none">
            <img src="${assetBase}/email/logo-white.png" width="150" height="121" alt="EverLove Homecare" style="display:block;width:150px;height:auto;border:0;outline:none;font-family:${SERIF};font-size:24px;color:#ffffff" />
          </a>
        </td></tr>
        <tr><td height="4" bgcolor="${C.gold}" style="height:4px;line-height:4px;font-size:4px;background:${C.gold};background-image:linear-gradient(90deg,${C.gold100},${C.gold},${C.gold600})">&nbsp;</td></tr>

        <!-- Body -->
        <tr><td class="px" bgcolor="#ffffff" style="background:#ffffff;padding:40px 44px 20px">
          ${body}
        </td></tr>

        <!-- Footer -->
        <tr><td class="px" bgcolor="${C.cream}" style="background:${C.cream};border-top:1px solid ${C.line};border-radius:0 0 24px 24px;padding:26px 44px 30px;text-align:center">
          <p style="margin:0 0 6px;font-family:${SERIF};font-size:17px;color:${C.plum900}">${escape(site.legalName)}</p>
          <p style="margin:0 0 14px;font-family:${SERIF};font-style:italic;font-size:14px;color:${C.brand}">${escape(site.tagline)}</p>
          <p style="margin:0 0 14px;font-family:${SANS};font-size:13px;line-height:1.7;color:${C.muted}">
            <a href="${site.phone.href}" style="color:${C.plum700};text-decoration:none;font-weight:700">${site.phone.display}</a>
            &nbsp;&middot;&nbsp;
            <a href="mailto:${site.email}" style="color:${C.plum700};text-decoration:none">${site.email}</a>
            <br /><a href="${site.url}" style="color:${C.plum700};text-decoration:none">${site.domain}</a>
          </p>
          <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:#8a7d95">${footer}</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ---------- 1. Confirmation sent to the person who booked ---------- */

export function confirmationEmail(d: ContactInput, opts: { assetBase: string; knownServices: string[] }): Email {
  const name = firstName(d.name);
  const services = d.services.filter((s) => opts.knownServices.includes(s));
  const relationship = d.relationship && d.relationship !== "Myself" ? d.relationship.toLowerCase() : "";

  const summary: [string, string][] = [["We'll call", `<strong>${escape(d.phone)}</strong>`]];
  if (d.relationship) summary.push(["Care is for", d.relationship === "Myself" ? "You" : `Your ${escape(relationship)}`]);
  if (services.length) summary.push(["Interested in", chips(services)]);

  const next = [
    { title: "We'll give you a call", text: "A member of our care team will reach out as soon as possible, usually the same day." },
    { title: "Your free consultation", text: "We'll listen and get to know your loved one's needs, routines, preferences and goals." },
    { title: "A care plan made for you", text: "We create a personalized plan and thoughtfully match the right caregiver." },
  ];

  const body = `
    ${eyebrow("Request received")}
    <h1 class="h1" style="margin:0 0 16px;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:normal;color:${C.plum900}">Thank you${name ? `, ${escape(name)}` : ""}.<br /><em style="color:${C.brand}">We're so glad you reached out.</em></h1>
    ${p(`We've received your request for a free, no-obligation consultation. Choosing care for ${relationship ? `your ${escape(relationship)}` : "someone you love"} is a big step, and we're honored you thought of us.`)}
    ${p("Here's what you shared with us:", `margin-bottom:12px;color:${C.muted};font-size:15px`)}
    ${panel(detailRows(summary))}
    ${h2("What happens next")}
    ${steps(next)}
    ${panel(
      `<p style="margin:0 0 6px;font-family:${SERIF};font-size:19px;color:${C.plum900}">Need us sooner?</p>
       <p style="margin:0 0 14px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.muted}">We're here for you. Call or text us anytime, or simply reply to this email.</p>
       ${button(site.phone.href, `Call ${site.phone.display}`)}`,
      C.gold100,
      "#ecd9b4",
    )}
    <p style="margin:0 0 4px;font-family:${SANS};font-size:16px;color:${C.ink}">With warmth and care,</p>
    <p style="margin:0 0 20px;font-family:${SERIF};font-style:italic;font-size:22px;color:${C.brand}">The EverLove Homecare Team</p>`;

  const html = layout({
    title: "We've received your request",
    preheader: "Thank you for reaching out. A member of our care team will call you soon, usually the same day.",
    assetBase: opts.assetBase,
    body,
    footer: `You're receiving this email because you requested a consultation at ${site.domain}. If this wasn't you, you can safely ignore it.`,
  });

  const text = [
    `Thank you${name ? `, ${name}` : ""}. We're so glad you reached out.`,
    "",
    "We've received your request for a free, no-obligation consultation.",
    "",
    "Here's what you shared with us:",
    `  We'll call: ${d.phone}`,
    ...(d.relationship ? [`  Care is for: ${d.relationship === "Myself" ? "You" : `Your ${relationship}`}`] : []),
    ...(services.length ? [`  Interested in: ${services.join(", ")}`] : []),
    "",
    "What happens next",
    ...next.map((s, i) => `  ${i + 1}. ${s.title}: ${s.text}`),
    "",
    `Need us sooner? Call or text ${site.phone.display}, or simply reply to this email.`,
    "",
    "With warmth and care,",
    "The EverLove Homecare Team",
    "",
    "--",
    `${site.legalName} · ${site.tagline}`,
    `${site.phone.display} · ${site.email} · ${site.url}`,
  ].join("\n");

  return { subject: `We've received your request${name ? `, ${name}` : ""}`, html, text };
}

/* ---------- 2. Notification sent to the EverLove team ---------- */

export function notificationEmail(d: ContactInput, opts: { assetBase: string; receivedAt?: Date }): Email {
  const first = firstName(d.name) || d.name;
  const received = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    dateStyle: "full",
    timeStyle: "short",
  }).format(opts.receivedAt ?? new Date());

  const rows: [string, string][] = [
    ["Name", `<strong>${escape(d.name)}</strong>`],
    ["Phone", `<a href="${telHref(d.phone)}" style="color:${C.brand};font-weight:700;text-decoration:none">${escape(d.phone)}</a>`],
    ["Email", d.email ? `<a href="mailto:${escape(d.email)}" style="color:${C.brand};text-decoration:none">${escape(d.email)}</a>` : `<span style="color:${C.muted}">Not provided</span>`],
    ["Care is for", d.relationship ? escape(d.relationship) : `<span style="color:${C.muted}">Not specified</span>`],
    ["Services", d.services.length ? chips(d.services) : `<span style="color:${C.muted}">None selected</span>`],
  ];

  const body = `
    ${eyebrow("New consultation request")}
    <h1 class="h1" style="margin:0 0 12px;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:normal;color:${C.plum900}">${escape(d.name)} would like a <em style="color:${C.brand}">free consultation</em></h1>
    ${p(`Received ${escape(received)} (Eastern) from the website contact form.`, `color:${C.muted};font-size:14px;margin-bottom:22px`)}
    <div style="margin:0 0 26px">
      ${button(telHref(d.phone), `Call ${escape(first)}`)}
      ${d.email ? button(`mailto:${escape(d.email)}?subject=${encodeURIComponent("Your EverLove Homecare consultation")}`, "Reply by email", "ghost") : ""}
    </div>
    ${panel(detailRows(rows), "#ffffff")}
    ${h2("Their message")}
    ${panel(
      `<p style="margin:0;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.ink};white-space:pre-wrap">${d.message ? escape(d.message) : `<span style="color:${C.muted}">No message added.</span>`}</p>`,
    )}
    ${p(
      d.email
        ? `&#10003; An automatic confirmation has also been emailed to ${escape(d.email)}.`
        : "They didn't leave an email address, so they haven't had a confirmation. A quick call is the best way to reach them.",
      `font-size:14px;color:${C.muted}`,
    )}`;

  const html = layout({
    title: `New consultation request: ${d.name}`,
    preheader: `${d.name} · ${d.phone}${d.services.length ? ` · ${d.services.join(", ")}` : ""}`,
    assetBase: opts.assetBase,
    body,
    footer: `Sent automatically from the contact form on ${site.domain}.${d.email ? " Replying to this email goes straight to the person who sent it." : ""}`,
  });

  const text = [
    `New consultation request from ${d.name}`,
    `Received ${received} (Eastern)`,
    "",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Email: ${d.email || "(not provided)"}`,
    `Care is for: ${d.relationship || "(not specified)"}`,
    `Services: ${d.services.length ? d.services.join(", ") : "(none selected)"}`,
    "",
    "Message:",
    d.message || "(no message)",
  ].join("\n");

  return {
    subject: `New consultation request: ${d.name}${d.services.length ? ` (${d.services.join(", ")})` : ""}`,
    html,
    text,
  };
}
