/**
 * Centralized Site Data
 * Single source of truth for navigation, partners, integrations, and shared content.
 * Update here — navbar, footer, mobile menu, and pages all stay in sync.
 */

// ─── Brand ───────────────────────────────────────────────────────────────────
export const BRAND = {
  name: "Scorgi",
  tagline: "The Full-Funnel Education Platform",
  logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/logos/Scorgi/scorgi-square.svg",
  email: "info@scorgi.com",
  demoUrl: "/routes/contact",
  copyright: `\u00A9 ${new Date().getFullYear()} Scorgi. All rights reserved.`,
  disclaimer:
    "SAT\u00AE is a trademark registered by the College Board, which is not affiliated with, and does not endorse, Scorgi.",
};

// ─── Product Navigation ──────────────────────────────────────────────────────
// Each product has ONE entry. Navbar columns, footer links, and mobile menu
// all derive from this array — add a product here, it appears everywhere.
export const PRODUCTS = [
  // Growth
  { icon: "bi-search", title: "SEO & GEO", shortTitle: "SEO", href: "/routes/seo-geo", category: "Growth" },
  { icon: "bi-chat-dots", title: "Thumper", shortTitle: "Thumper", href: "/routes/thumper", category: "Growth" },
  { icon: "bi-star", title: "Review Collection", shortTitle: "Reviews", href: "/routes/reviews", category: "Growth" },
  { icon: "bi-bell", title: "Notifications", shortTitle: "Notifications", href: "/routes/notifications", category: "Growth" },

  // Platform
  { icon: "bi-clipboard-check", title: "Practice Tests", shortTitle: "Tests", href: "/routes/test-engine", category: "Platform" },
  { icon: "bi-calendar-check", title: "Scheduling", shortTitle: "Scheduling", href: "/routes/scheduling", category: "Platform" },
  { icon: "bi-bar-chart-line", title: "Insights", shortTitle: "Insights", href: "/routes/insights", category: "Platform" },
  { icon: "bi-robot", title: "AI Suite", shortTitle: "AI Suite", href: "/routes/ai-suite", category: "Platform" },
  { icon: "bi-mortarboard", title: "School Tracker", shortTitle: "Schools", href: "/routes/school-tracker", category: "Platform" },

  // Business
  { icon: "bi-speedometer2", title: "Dashboard", shortTitle: "Dashboard", href: "/routes/dashboard", category: "Business" },
  { icon: "bi-cart-check", title: "Commerce", shortTitle: "Commerce", href: "/routes/commerce", category: "Business" },
  { icon: "bi-pencil-square", title: "Content Creation", shortTitle: "Content", href: "/routes/content-creation", category: "Business" },
  { icon: "bi-palette", title: "White-Label", shortTitle: "White-Label", href: "/routes/white-label", category: "Business" },
  { icon: "bi-kanban", title: "Benge Kanban", shortTitle: "Benge", href: "/routes/benge", category: "Business" },
  { icon: "bi-calendar2-heart", title: "PTO System", shortTitle: "PTO", href: "/routes/pto", category: "Business" },
  { icon: "bi-tablet-landscape", title: "Kiosk & Time Clock", shortTitle: "Kiosk", href: "/routes/kiosk", category: "Business" },
  { icon: "bi-megaphone", title: "Product Updates", shortTitle: "Updates", href: "/routes/product-updates", category: "Business" },
];

/** Helper: group products by category */
export const productsByCategory = () => {
  /** @type {Record<string, typeof PRODUCTS>} */
  const groups = {};
  for (const p of PRODUCTS) {
    (groups[p.category] ??= []).push(p);
  }
  return groups;
};

/** All product page slugs — used for active-nav detection */
export const PRODUCT_SLUGS = PRODUCTS.map((p) => {
  const match = p.href.match(/\/([^/]+)\/?$/);
  return match ? match[1] : "";
}).filter(Boolean);

// ─── Top-Level Nav Links ─────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Case Studies", href: "/routes/case-studies/" },
  { label: "Testimonials", href: "/routes/testimonials" },
  { label: "Pricing", href: "/routes/pricing" },
  { label: "Newsletters", href: "/routes/resources" },
];

// ─── Mobile-Only Nav Links (shown at top of offcanvas) ───────────────────────
export const MOBILE_NAV_LINKS = [
  { icon: "bi-house", label: "Home", href: "/" },
  { icon: "bi-grid", label: "All Features", href: "/routes/features" },
  { icon: "bi-buildings", label: "Case Studies", href: "/routes/case-studies/" },
  { icon: "bi-chat-quote", label: "Testimonials", href: "/routes/testimonials" },
  { icon: "bi-tag", label: "Pricing", href: "/routes/pricing" },
  { icon: "bi-journal-text", label: "Newsletters", href: "/routes/resources" },
  { icon: "bi-envelope", label: "Contact", href: "mailto:info@scorgi.com" },
];

// ─── Footer Link Columns ─────────────────────────────────────────────────────
// Product links in the footer (subset of PRODUCTS for brevity)
export const FOOTER_PRODUCT_LINKS = [
  { label: "All Features", href: "/routes/features" },
  { label: "Practice Tests", href: "/routes/test-engine" },
  { label: "Scheduling", href: "/routes/scheduling" },
  { label: "AI Suite", href: "/routes/ai-suite" },
  { label: "Dashboard", href: "/routes/dashboard" },
  { label: "Insights", href: "/routes/insights" },
  { label: "Commerce", href: "/routes/commerce" },
];

export const FOOTER_COMPANY_LINKS = [
  { label: "Case Studies", href: "/routes/case-studies/" },
  { label: "Testimonials", href: "/routes/testimonials" },
  { label: "Pricing", href: "/routes/pricing" },
  { label: "Newsletters", href: "/routes/resources" },
  { label: "Compare", href: "/routes/scorgi-vs-competitors" },
  { label: "Product Updates", href: "/routes/product-updates" },
  { label: "Book a Demo", href: "/routes/contact" },
];

// ─── Partners & Integrations ─────────────────────────────────────────────────
export const PARTNERS = [
  { name: "Stripe", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/stripeLogo.png" },
  { name: "Twilio", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/twilioLogo.svg.png" },
  { name: "DigitalOcean", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/digitalOceanLogo.png" },
  { name: "OpenAI", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/chatGPTLogo.png" },
];

export const INTEGRATIONS = [
  { name: "Stripe", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/stripeLogo.png" },
  { name: "Twilio", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/twilioLogo.svg.png" },
  { name: "DigitalOcean", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/digitalOceanLogo.png" },
  { name: "OpenAI", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website/scorgi/poweredBy/chatGPTLogo.png" },
  { name: "Google Meet", icon: "bi-camera-video" },
  { name: "Slack", icon: "bi-slack" },
  { name: "Google Maps", icon: "bi-geo-alt" },
  { name: "iCal", icon: "bi-calendar-event" },
  { name: "ImgProxy", icon: "bi-image" },
  { name: "CDN Storage", icon: "bi-hdd-network" },
  { name: "MathJax", icon: "bi-calculator" },
];

export const TRUSTED_BY = [
  { name: "Foley Prep", logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Fbranding%2Ffoleyprep-logo-vertical.svg", url: "https://foleyprep.com" },
];
