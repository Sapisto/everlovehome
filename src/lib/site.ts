/**
 * Single source of truth for business details.
 * Change something here and it updates everywhere on the site.
 */
export const site = {
  name: "EverLove Homecare",
  legalName: "EverLove Homecare LLC",
  tagline: "caring for your loved ones",
  url: "https://everlovehomecarellc.com",
  domain: "everlovehomecarellc.com",
  email: "everlovehomecarellc@gmail.com",
  phone: {
    display: "(689) 677-0202",
    international: "+1 (689) 677-0202",
    href: "tel:+16896770202",
    schema: "+1-689-677-0202",
  },
  // TODO(client): confirm before launch.
  availability: "24/7 Care. Always Here.",
  social: {
    // Add real profile URLs when available; empty entries are hidden.
    facebook: "",
    instagram: "",
    linkedin: "",
  },
} as const;

export const nav = [
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#plan", label: "Find Care" },
  { href: "/#process", label: "How It Works" },
  { href: "/#careers", label: "Careers" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const mailto = (subject?: string, body?: string): string => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString().replace(/\+/g, "%20");
  return `mailto:${site.email}${qs ? `?${qs}` : ""}`;
};
