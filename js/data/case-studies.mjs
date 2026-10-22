// @ts-check
/**
 * Case Study Registry
 *
 * One entry per partner. Each route at /routes/case-studies/{slug}/ declares
 * its slug via <meta name="case-study-slug" content="..."> and the shared
 * page initializer at /js/pages/case-study.mjs renders this data.
 *
 * Adding a new case study:
 *   1. Add an entry below keyed by slug.
 *   2. Copy /routes/case-studies/foley-prep/index.html to a new folder named
 *      after the slug; change title, description, and case-study-slug meta.
 *
 * Page layout:
 *   1. Hero          — partner logo, title, subtitle, links, and the tutoring photo
 *   2. Stats          — 3–4 numbers in a band under the hero
 *   3. Programs       — the exams and subjects they teach, as chips
 *   4. Story          — Challenge / Solution / Outcome as three cards
 *   5. Platform       — grid of Scorgi screenshots they actually use
 *   6. Final CTA
 *
 * Anything left undefined is skipped. No fabricated content ever ships.
 *
 * @typedef {{value: string, label: string, footnote?: string}} StatItem
 * @typedef {{heading: string, body: string}} StorySection
 * @typedef {{title: string, src: string, caption: string}} PlatformImage
 * @typedef {{src?: string, caption: string, alt?: string}} TutoringImage
 *
 * @typedef {{
 *   slug: string,
 *   name: string,
 *   url: string,
 *   logo: string,
 *   scope: string,
 *   teaser?: string,
 *   pageTitle: string,
 *   pageDescription: string,
 *   hero: { title: string, accent?: string, subtitle: string },
 *   programs?: string[],
 *   tutoringImage?: TutoringImage,
 *   stats?: StatItem[],
 *   story?: { challenge?: StorySection, solution?: StorySection, outcome?: StorySection },
 *   platformImages?: PlatformImage[],
 *   quote?: { text: string, attribution: string },
 *   pdfUrl?: string,
 *   cta: { heading: string, subheading: string },
 * }} CaseStudy
 */

/** @type {Record<string, CaseStudy>} */
export const CASE_STUDIES = {
  // ─────────────────────────────────────────────────────────────────────────
  // Foley Prep — flagship case study. All facts sourced from foleyprep.com.
  // ─────────────────────────────────────────────────────────────────────────
  "foley-prep": {
    slug: "foley-prep",
    name: "Foley Prep",
    url: "https://foleyprep.com",
    logo: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Fbranding%2Ffoleyprep-logo-vertical.svg",
    scope: "Multi-location SAT/ACT prep — 7 NJ locations, 20,000+ students since 2013",
    teaser: "Foley Prep didn't just adopt a tutoring SaaS — they built one. After investing $1M+ in technology and serving 20,000+ students, the platform they live on every day became Scorgi.",
    pageTitle: "Scorgi - Foley Prep Case Study",
    pageDescription: "How Foley Prep — a 7-location New Jersey tutoring company that has trained 20,000+ students since 2013 — runs its entire operation on Scorgi.",
    hero: {
      title: "How Foley Prep runs on",
      accent: "Scorgi",
      subtitle: "Seven locations. Sixteen exams. Twenty thousand students. One platform built for the job.",
    },
    // Exams and subjects, from the challenge copy below (foleyprep.com).
    programs: ["SAT", "PSAT", "ACT", "MCVSD", "SSAT", "ISEE", "HSPT", "GMAT", "GRE", "MCAT", "DAT", "AP subjects"],
    // Tutoring photo — single feature image. When `src` is undefined the
    // renderer shows a tasteful placeholder so the layout still flows; once
    // a real photo is uploaded to the CDN, set `src` and the placeholder
    // is replaced.
    tutoringImage: {
      src: "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Website%2Flanding%2Fcarousel%2Flanding-bell-works-3.webp",
      caption: "A Foley Prep session at one of seven NJ locations.",
      alt: "Foley Prep tutoring session",
    },
    // 4 stats, all sourced from foleyprep.com — one consistent row
    stats: [
      { value: "7", label: "NJ locations" },
      { value: "20,000+", label: "Students trained since 2013" },
      { value: "30,000+", label: "Practice questions" },
      { value: "4.9★", label: "Google rating" },
    ],
    story: {
      challenge: {
        heading: "The problem with growing past three locations",
        body: "Foley Prep covers SAT, PSAT, ACT, MCVSD, SSAT, ISEE, HSPT, GMAT, GRE, MCAT, DAT, AP subjects, and more — across seven New Jersey locations and three formats (1-on-1, small group, in-person and online). Standard tutoring SaaS handles scheduling and billing. None of it handles a 30,000+ question proprietary content bank, white-label student dashboards across multiple sites, instant lead response, and a coordinated college-application workflow on the same platform.",
      },
      solution: {
        heading: "One platform, built for the job",
        body: "Foley Prep runs its entire operation on Scorgi: scheduling and payments across all seven locations, the proprietary question bank served through Scorgi's auto-graded test engine, white-label student dashboards under the Foley Prep brand, lead engagement via Communications, automated review collection, and the full AI tutoring suite. The same platform Foley Prep depends on internally is what Scorgi makes available to other tutoring businesses.",
      },
      outcome: {
        heading: "A tutoring company that runs like a software company",
        body: "Foley Prep continues to expand without the operational drag that caps most tutoring businesses at three or four locations. The numbers on this page are self-reported on foleyprep.com (reviewed October 2026).",
      },
    },
    // Product screenshots Foley Prep actually uses (captured October 2026, client data blurred)
    platformImages: [
      {
        title: "Multi-Location Booking",
        src: "/images/scorgi-app/client-booking-locations-2026-10.webp",
        caption: "Families choose any of Foley Prep's locations, then book classes, mock exams, and consultations.",
      },
      {
        title: "Practice Test Engine",
        src: "/images/foley-prep/test-demo-question-2026-10.webp",
        caption: "30,000+ proprietary questions, delivered with test-day tools and auto-grading.",
      },
      {
        title: "Insights & Worksheets",
        src: "/images/foley-prep/progress-board-wide-2026-10.webp",
        caption: "Every topic sorted Beginner to Mastery, ranked by the points at stake. Public example data.",
      },
      {
        title: "Staff Scheduling",
        src: "/images/scorgi-app/scorgi-schedule-staff-2026-10.webp",
        caption: "Every tutor, class, and mock exam across the locations, by day or by week.",
      },
      {
        title: "Front Desk Kiosk",
        src: "/images/scorgi-app/kiosk-check-in-2026-10.webp",
        caption: "Students check themselves in on the lobby kiosk; staff see the count update live.",
      },
      {
        title: "Management Dashboard",
        src: "/images/scorgi-app/management-overview-2026-10.webp",
        caption: "Session requests, payments, time off, and retention in one place for the leadership team.",
      },
    ],
    // quote: {} — pending Dr. Ron Foley sign-off; renderer skips when undefined.
    // pdfUrl: "..." — pending generation; renderer hides the PDF CTA when undefined.
    cta: {
      heading: "Run your tutoring company like Foley Prep does",
      subheading: "Book a 20-minute walkthrough — we'll show you what Scorgi looks like under the hood of a multi-location prep company.",
    },
  },
};

/**
 * Look up a case study by slug.
 * @param {string} slug
 * @returns {CaseStudy | undefined}
 */
export const getCaseStudy = (slug) => CASE_STUDIES[slug];

/** All case studies as a list, in registry order. */
export const ALL_CASE_STUDIES = Object.values(CASE_STUDIES);
