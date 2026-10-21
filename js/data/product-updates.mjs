/**
 * Product Updates — the real shipped-feature record.
 *
 * Every entry below traces to merged work in the Scorgi application repo
 * (foleyprep/nodeserver), reviewed 2026-09-07. Nothing here is aspirational:
 * if a feature is not in the commit history, it is not on this page.
 *
 * To refresh: read the commit subjects for the month, pick the handful that
 * a customer would actually notice, and add a new entry at the TOP. The
 * "Latest" badge is derived from position, so no badge editing is needed.
 *
 * @typedef {{
 *   month: string,        // "YYYY-MM" — drives ordering and the display label
 *   title: string,
 *   description: string,
 *   features: string[],
 * }} ProductUpdate
 */

/** @type {ProductUpdate[]} newest first */
export const PRODUCT_UPDATES = [
  {
    month: "2026-09",
    title: "Ad Studio — AI Planning, Copy & Image Generation",
    description:
      "Ad Studio gained a full Studio tab: plan a campaign, generate the copy, and generate the imagery without leaving Scorgi. Channel classification ties every ad back to the purchases it actually drove, so you can see which creative converts.",
    features: [
      "AI campaign planning, copy generation, and image generation",
      "Channel classification for attribution reporting",
      "Per-ad conversion tracking linked to real purchases",
    ],
  },
  {
    month: "2026-09",
    title: "Message Blast Open Tracking & Score-Day Drafts",
    description:
      "Message Blast now reports which emails were actually opened, and automatically prepares draft blasts on score release day so you are not writing the same message every cycle. Blasts can also reach users whose contact methods are not yet verified.",
    features: [
      "Per-blast email open tracking",
      "Automatic draft creation on score release day",
      "Send to users with unverified contact methods",
      "Twilio SMS opt-out status tracked and surfaced in the Communications dashboard",
    ],
  },
  {
    month: "2026-08",
    title: "Contact Hours, Transaction Origin & Handbook Editing",
    description:
      "A month of operational depth. Staff schedule and staff portal now surface contact-hour statistics, every transaction records where it came from, and the Handbook application became fully editable.",
    features: [
      "Contact hours stats in the staff schedule sidebar and staff portal",
      "Transaction Origin field, filters, and badges across management tools",
      "Edit PolicyStatement documents in the Handbook, with improved numbering",
      "Record editor redesign — edit extra time and make edits without regrading",
      "Staff-initiated contact method verification",
    ],
  },
  {
    month: "2026-07",
    title: "Timekeeping on the Staff Schedule",
    description:
      "Clock in and clock out moved directly into the staff schedule, alongside a new staff member creation wizard and a Stripe invoice tool for custom line items.",
    features: [
      "Clock in / clock out (timekeeping) built into the staff schedule",
      "Create Staff Member wizard",
      "Stripe invoice tool with optional custom line items",
      "GRE test score support",
      "Automatic meeting links for remote sessions",
    ],
  },
  {
    month: "2026-06",
    title: "Chati Everywhere & the Documentation Portal",
    description:
      "Chati moved onto every page with a rebuilt mobile experience. Alongside it: the first pass of Ad Studio for social content, a developer documentation portal, and the initial Handbook application.",
    features: [
      "Chati available on all pages, redesigned for mobile",
      "Ad Studio first pass — social ad creation with conversion tracking",
      "Developer docs route and documentation portal",
      "Handbook application initial release",
      "Kiosk: remote clock-in option, lateness SMS logs, cross-kiosk shift handling",
    ],
  },
  {
    month: "2026-05",
    title: "Guided Tours & Test Editor Improvements",
    description:
      "New guided tours walk clients and staff through the platform, while the test editor gained a problem finder and a reimplemented multiple-choice problem type.",
    features: [
      "Guided tours for clients and staff",
      "Create new problems via Problem Finder in the test editor",
      "Multiple choice problem type reimplementation",
      "Valuable and bonus hours calculation for instructors",
      "Live camera view on the kiosk admin page",
    ],
  },
];

/**
 * "2026-09" → "September 2026". Parsed as UTC so the label never slips a month
 * for viewers behind UTC.
 * @param {string} month
 */
export const formatUpdateMonth = (month) => {
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};
