// @ts-check
/**
 * Case Study Page Renderer
 *
 * Six simple sections, consistent typography, restrained accent color.
 * Each section renders only when its data exists; missing sections are
 * skipped so the page flows cleanly even when content is partial.
 *
 * Three image zones are deliberate:
 *   - Hero logo
 *   - Tutoring photo (single full-width feature image)
 *   - Platform shots (2×2 grid of Scorgi screenshots they actually use)
 *
 * @typedef {import("../../data/case-studies.mjs").CaseStudy} CaseStudy
 */

/**
 * @param {CaseStudy} data
 * @param {HTMLElement} mount
 */
export function renderCaseStudyPage(data, mount) {
  mount.innerHTML = "";

  // Hero embeds the stats card on the right when stats exist; the standalone
  // stats section is intentionally removed so the numbers aren't shown twice.
  mount.appendChild(buildHero(data));
  if (data.tutoringImage) mount.appendChild(buildTutoringImage(data));
  if (data.story && hasAnyStory(data)) mount.appendChild(buildStory(data));
  if (data.platformImages?.length) mount.appendChild(buildPlatform(data));
  if (data.quote) mount.appendChild(buildQuote(data));
  if (data.pdfUrl) mount.appendChild(buildPdfCta(data));
  mount.appendChild(buildFinalCta(data));
}

// ─── Hero ───────────────────────────────────────────────────────────────────

/** @param {CaseStudy} data */
function buildHero(data) {
  const stats = data.stats || [];
  const hasStats = stats.length > 0;

  const section = document.createElement("section");
  section.className = `cs-hero ${hasStats ? "cs-hero-with-stats" : ""}`;

  const statsCard = hasStats
    ? `
      <aside class="cs-hero-stats" data-aos="fade-up" data-aos-delay="150">
        <div class="cs-hero-stats-eyebrow">At a glance</div>
        <div class="cs-hero-stats-grid">
          ${stats
            .map(
              (s) => `
              <div class="cs-hero-stat">
                <div class="cs-hero-stat-value">${s.value}</div>
                <div class="cs-hero-stat-label">${s.label}</div>
                ${s.footnote ? `<div class="cs-hero-stat-footnote">${s.footnote}</div>` : ""}
              </div>`
            )
            .join("")}
        </div>
      </aside>`
    : "";

  section.innerHTML = `
    <div class="container">
      <div class="cs-hero-grid">
        <div class="cs-hero-content" data-aos="fade-up">
          <span class="section-eyebrow">Customer Story</span>
          <img src="${data.logo}" alt="${data.name} logo" class="cs-hero-logo" />
          <h1 class="cs-hero-title">${data.hero.title}</h1>
          <p class="cs-hero-subtitle">${data.hero.subtitle}</p>
          <a href="${data.url}" target="_blank" rel="noopener" class="cs-hero-link">
            ${displayUrl(data.url)} <i class="bi bi-arrow-up-right"></i>
          </a>
        </div>
        ${statsCard}
      </div>
    </div>
  `;
  return section;
}

// ─── Tutoring photo (side-by-side: framed photo + prominent caption) ───────

/** @param {CaseStudy} data */
function buildTutoringImage(data) {
  const t = data.tutoringImage;
  if (!t) return document.createElement("section");

  // If a real photo URL exists, render it. Otherwise render a tasteful
  // gradient placeholder so the layout still flows.
  const figure = t.src
    ? `
      <div class="cs-tutoring-frame">
        <img src="${t.src}" alt="${t.alt || data.name + " tutoring session"}" class="cs-tutoring-image" loading="lazy" />
      </div>`
    : `
      <div class="cs-tutoring-frame cs-tutoring-frame-placeholder" aria-label="Tutoring photo placeholder">
        <i class="bi bi-camera"></i>
        <span>Tutoring photo</span>
      </div>`;

  const section = document.createElement("section");
  section.className = "cs-tutoring";
  section.innerHTML = `
    <div class="container">
      <div class="cs-tutoring-grid" data-aos="fade-up">
        ${figure}
        <div class="cs-tutoring-text">
          <span class="cs-tutoring-eyebrow">Inside ${data.name}</span>
          ${t.caption ? `<p class="cs-tutoring-caption">${t.caption}</p>` : ""}
        </div>
      </div>
    </div>
  `;
  return section;
}

// ─── Story (Challenge / Solution / Outcome — plain prose) ──────────────────

/** @param {CaseStudy} data */
function buildStory(data) {
  const story = data.story || {};
  /** @type {string[]} */
  const blocks = [];
  if (story.challenge) blocks.push(storyBlock("The Challenge", story.challenge));
  if (story.solution) blocks.push(storyBlock("The Solution", story.solution));
  if (story.outcome) blocks.push(storyBlock("The Outcome", story.outcome));

  const section = document.createElement("section");
  section.className = "cs-story";
  section.innerHTML = `
    <div class="container">
      <div class="cs-story-inner" data-aos="fade-up">${blocks.join("")}</div>
    </div>
  `;
  return section;
}

/**
 * @param {string} eyebrow
 * @param {{heading: string, body: string}} block
 */
function storyBlock(eyebrow, block) {
  return `
    <div class="cs-story-block">
      <span class="cs-story-eyebrow">${eyebrow}</span>
      <h2 class="cs-story-heading">${block.heading}</h2>
      <p class="cs-story-body">${block.body}</p>
    </div>
  `;
}

// ─── Platform — alternating rows (image one side, text the other) ──────────

/** @param {CaseStudy} data */
function buildPlatform(data) {
  const rows = (data.platformImages || [])
    .map(
      (p) => `
      <div class="cs-platform-row" data-aos="fade-up">
        <div class="cs-platform-row-media">
          <img src="${p.src}" alt="${p.title}" loading="lazy" />
        </div>
        <div class="cs-platform-row-text">
          <h3 class="cs-platform-row-title">${p.title}</h3>
          <p class="cs-platform-row-desc">${p.caption}</p>
        </div>
      </div>`
    )
    .join("");

  const section = document.createElement("section");
  section.className = "cs-platform-section";
  section.innerHTML = `
    <div class="container">
      <div class="cs-platform-header" data-aos="fade-up">
        <span class="section-eyebrow">The Platform</span>
        <h2 class="cs-platform-heading">What ${data.name} runs on Scorgi</h2>
      </div>
      <div class="cs-platform-rows">${rows}</div>
    </div>
  `;
  return section;
}

// ─── Pull quote (rendered only when partner-approved) ──────────────────────

/** @param {CaseStudy} data */
function buildQuote(data) {
  if (!data.quote) return document.createElement("section");
  const section = document.createElement("section");
  section.className = "cs-quote";
  section.innerHTML = `
    <div class="container" data-aos="fade-up">
      <blockquote class="cs-quote-block">
        <p>&ldquo;${data.quote.text}&rdquo;</p>
        <footer class="cs-quote-attribution">— ${data.quote.attribution}</footer>
      </blockquote>
    </div>
  `;
  return section;
}

// ─── PDF CTA ────────────────────────────────────────────────────────────────

/** @param {CaseStudy} data */
function buildPdfCta(data) {
  const section = document.createElement("section");
  section.className = "cs-pdf";
  section.innerHTML = `
    <div class="container" data-aos="fade-up">
      <div class="cs-pdf-card">
        <div class="cs-pdf-icon"><i class="bi bi-file-earmark-pdf"></i></div>
        <div class="cs-pdf-text">
          <h3>Read the full case study</h3>
          <p>A deeper look at how ${data.name} runs on Scorgi.</p>
        </div>
        <a href="${data.pdfUrl}" class="btn btnGradient" target="_blank" rel="noopener">
          <i class="bi bi-download me-2"></i>Download PDF
        </a>
      </div>
    </div>
  `;
  return section;
}

// ─── Final CTA ──────────────────────────────────────────────────────────────

/** @param {CaseStudy} data */
function buildFinalCta(data) {
  const section = document.createElement("section");
  section.className = "final-cta-section";
  section.innerHTML = `
    <div class="container text-center" data-aos="fade-up">
      <h2 class="final-cta-heading">${data.cta.heading}</h2>
      <p class="final-cta-subtitle">${data.cta.subheading}</p>
      <a href="/routes/contact" class="btn btnGradient btn-lg mt-3 mx-auto">Book a Demo</a>
    </div>
  `;
  return section;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** @param {CaseStudy} data */
function hasAnyStory(data) {
  return Boolean(data.story?.challenge || data.story?.solution || data.story?.outcome);
}

function displayUrl(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
