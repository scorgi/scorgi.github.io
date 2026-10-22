// @ts-check
/**
 * Case Study Page Renderer
 *
 * Hero with the tutoring photo, a stats band, program chips, the story as
 * three cards, and a grid of framed Scorgi screenshots. Each section renders
 * only when its data exists, so the page flows cleanly with partial content.
 *
 * @typedef {import("../../data/case-studies.mjs").CaseStudy} CaseStudy
 */

/**
 * @param {CaseStudy} data
 * @param {HTMLElement} mount
 */
export function renderCaseStudyPage(data, mount) {
  mount.innerHTML = "";

  // The hero carries the tutoring photo; the stats sit in a band just under it.
  mount.appendChild(buildHero(data));
  if (data.stats?.length) mount.appendChild(buildStats(data));
  if (data.programs?.length) mount.appendChild(buildPrograms(data));
  if (data.story && hasAnyStory(data)) mount.appendChild(buildStory(data));
  if (data.platformImages?.length) mount.appendChild(buildPlatform(data));
  if (data.quote) mount.appendChild(buildQuote(data));
  if (data.pdfUrl) mount.appendChild(buildPdfCta(data));
  mount.appendChild(buildFinalCta(data));
}

// ─── Hero (story on the left, tutoring photo on the right) ────────────────

/** @param {CaseStudy} data */
function buildHero(data) {
  const t = data.tutoringImage;
  const photo = t?.src
    ? `
      <figure class="cs-hero-photo" data-aos="fade-up" data-aos-delay="120">
        <img src="${t.src}" alt="${t.alt || data.name + " tutoring session"}" />
        ${t.caption ? `<figcaption><i class="bi bi-geo-alt-fill"></i>${t.caption}</figcaption>` : ""}
      </figure>`
    : "";

  const section = document.createElement("section");
  section.className = "cs-hero";
  section.innerHTML = `
    <div class="container">
      <div class="cs-hero-grid ${photo ? "cs-hero-grid-photo" : ""}">
        <div class="cs-hero-content" data-aos="fade-up">
          <div class="cs-hero-brand">
            <span class="cs-hero-logo-wrap"><img src="${data.logo}" alt="${data.name} logo" class="cs-hero-logo" /></span>
            <span class="section-eyebrow mb-0">Customer Story</span>
          </div>
          <h1 class="cs-hero-title">${data.hero.title}${data.hero.accent ? ` <span class="gradient-text">${data.hero.accent}</span>` : ""}</h1>
          <p class="cs-hero-subtitle">${data.hero.subtitle}</p>
          <div class="cs-hero-actions">
            <a href="/routes/contact" class="btn btnGradient">Book a Demo</a>
            <a href="${data.url}" target="_blank" rel="noopener" class="cs-hero-link">
              Visit ${displayUrl(data.url)} <i class="bi bi-arrow-up-right"></i>
            </a>
          </div>
        </div>
        ${photo}
      </div>
    </div>
  `;
  return section;
}

// ─── Stats band ─────────────────────────────────────────────────────────────

/** @param {CaseStudy} data */
function buildStats(data) {
  const section = document.createElement("section");
  section.className = "cs-stats";
  section.innerHTML = `
    <div class="container">
      <div class="cs-stats-band" data-aos="fade-up">
        ${(data.stats || [])
          .map(
            (s) => `
            <div class="cs-stat">
              <div class="cs-stat-value">${s.value}</div>
              <div class="cs-stat-label">${s.label}</div>
              ${s.footnote ? `<div class="cs-stat-footnote">${s.footnote}</div>` : ""}
            </div>`
          )
          .join("")}
      </div>
    </div>
  `;
  return section;
}

// ─── Programs (exams and subjects they teach) ──────────────────────────────

/** @param {CaseStudy} data */
function buildPrograms(data) {
  const section = document.createElement("section");
  section.className = "cs-programs";
  section.innerHTML = `
    <div class="container" data-aos="fade-up">
      <p class="cs-programs-label">What ${data.name} teaches on Scorgi</p>
      <div class="cs-programs-chips">
        ${(data.programs || []).map((p) => `<span class="cs-chip">${p}</span>`).join("")}
      </div>
    </div>
  `;
  return section;
}

// ─── Story (Challenge / Solution / Outcome — three cards) ──────────────────

/** @param {CaseStudy} data */
function buildStory(data) {
  const story = data.story || {};
  /** @type {string[]} */
  const blocks = [];
  if (story.challenge) blocks.push(storyBlock("The Challenge", "bi-signpost-split", story.challenge, blocks.length));
  if (story.solution) blocks.push(storyBlock("The Solution", "bi-grid-1x2", story.solution, blocks.length));
  if (story.outcome) blocks.push(storyBlock("The Outcome", "bi-graph-up-arrow", story.outcome, blocks.length));

  const section = document.createElement("section");
  section.className = "cs-story";
  section.innerHTML = `
    <div class="container">
      <div class="cs-section-header" data-aos="fade-up">
        <span class="section-eyebrow">The Story</span>
        <h2 class="cs-section-heading">From growing pains to <span class="gradient-text">one platform</span></h2>
      </div>
      <div class="cs-story-grid">${blocks.join("")}</div>
    </div>
  `;
  return section;
}

/**
 * @param {string} eyebrow
 * @param {string} icon
 * @param {{heading: string, body: string}} block
 * @param {number} i
 */
function storyBlock(eyebrow, icon, block, i) {
  return `
    <article class="cs-story-card" data-aos="fade-up" data-aos-delay="${i * 100}">
      <div class="cs-story-card-top">
        <span class="cs-story-icon"><i class="bi ${icon}"></i></span>
        <span class="cs-story-eyebrow">${eyebrow}</span>
      </div>
      <h3 class="cs-story-heading">${block.heading}</h3>
      <p class="cs-story-body">${block.body}</p>
    </article>
  `;
}

// ─── Platform — grid of framed screenshots ─────────────────────────────────

/** @param {CaseStudy} data */
function buildPlatform(data) {
  const tiles = (data.platformImages || [])
    .map(
      (p, i) => `
      <figure class="cs-shot" data-aos="fade-up" data-aos-delay="${(i % 3) * 100}">
        <div class="cs-shot-frame">
          <div class="cs-shot-bar"><span></span><span></span><span></span></div>
          <img src="${p.src}" alt="${p.title}" loading="lazy" />
        </div>
        <figcaption>
          <h3 class="cs-shot-title">${p.title}</h3>
          <p class="cs-shot-desc">${p.caption}</p>
        </figcaption>
      </figure>`
    )
    .join("");

  const section = document.createElement("section");
  section.className = "cs-platform-section";
  section.innerHTML = `
    <div class="container">
      <div class="cs-section-header" data-aos="fade-up">
        <span class="section-eyebrow">The Platform</span>
        <h2 class="cs-section-heading">What ${data.name} runs on <span class="gradient-text">Scorgi</span></h2>
      </div>
      <div class="cs-shots">${tiles}</div>
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
