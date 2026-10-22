// @ts-check
/**
 * Case Study Spotlight — index page layout
 *
 * Clean two-column card. Content on the left, a framed product preview on
 * the right inside a brand-tinted panel. The image is bounded (fixed
 * aspect ratio + padding around it) so it reads as a deliberate visual
 * rather than a wallpaper.
 *
 * The teaser prose is intentionally distinct from the individual page's
 * hero subtitle so visitors get a fresh hook rather than a re-summary of
 * what they're about to read.
 */

import { ALL_CASE_STUDIES } from "../../data/case-studies.mjs";

/** @typedef {import("../../data/case-studies.mjs").CaseStudy} CaseStudy */

/** @param {string} containerId */
export function renderCaseStudySpotlight(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const all = ALL_CASE_STUDIES;
  if (!all.length) return;

  // Spotlight = first study with rich data (teaser + stats + platform images).
  const spotlightIdx = all.findIndex((cs) => cs.teaser && cs.stats?.length && cs.platformImages?.length);
  const spotlight = spotlightIdx >= 0 ? all[spotlightIdx] : null;
  const others = all.filter((_, i) => i !== spotlightIdx);

  if (spotlight) container.appendChild(buildSpotlight(spotlight));
  if (others.length) container.appendChild(buildSecondaryGrid(others));
}

/** @param {CaseStudy} cs */
function buildSpotlight(cs) {
  // Prefer a tutoring photo for the visual when one exists; otherwise use
  // the first platform screenshot.
  const visualSrc = cs.tutoringImage?.src || cs.platformImages?.[0]?.src;
  const stats = (cs.stats || []).slice(0, 3);

  const wrap = document.createElement("article");
  wrap.className = "cs-spotlight";
  wrap.setAttribute("data-aos", "fade-up");

  wrap.innerHTML = `
    <div class="cs-spotlight-content">
      <span class="cs-spotlight-eyebrow">Featured customer</span>
      <div class="cs-spotlight-brand">
        <img src="${cs.logo}" alt="${cs.name} logo" class="cs-spotlight-logo" />
        <div class="cs-spotlight-brand-meta">
          <h2 class="cs-spotlight-name">${cs.name}</h2>
          <p class="cs-spotlight-scope">${cs.scope}</p>
        </div>
      </div>
      <p class="cs-spotlight-teaser">${cs.teaser || ""}</p>
      ${
        stats.length
          ? `
        <div class="cs-spotlight-stats">
          ${stats
            .map(
              (s) => `
              <div class="cs-spotlight-stat">
                <div class="cs-spotlight-stat-value">${s.value}</div>
                <div class="cs-spotlight-stat-label">${s.label}</div>
              </div>`,
            )
            .join("")}
        </div>`
          : ""
      }
      ${
        cs.platformImages?.length
          ? `
        <div class="cs-spotlight-modules">
          <span class="cs-spotlight-modules-label">Runs on Scorgi</span>
          ${cs.platformImages.map((p) => `<span class="cs-chip cs-chip-sm">${p.title}</span>`).join("")}
        </div>`
          : ""
      }
      <div class="cs-spotlight-actions">
        <a href="/routes/case-studies/${cs.slug}" class="btn btnGradient">
          Read the Story <i class="bi bi-arrow-right ms-2"></i>
        </a>
      </div>
    </div>
    ${
      visualSrc
        ? `
      <div class="cs-spotlight-visual">
        <img src="${visualSrc}" alt="${cs.name} on Scorgi" loading="lazy" />
      </div>`
        : ""
    }
  `;
  return wrap;
}

/** @param {CaseStudy[]} studies */
function buildSecondaryGrid(studies) {
  const wrap = document.createElement("section");
  wrap.className = "cs-secondary";

  const cards = studies
    .map((cs, i) => {
      const isPending = !cs.stats?.length && !cs.platformImages?.length;
      return `
        <div class="cs-secondary-card ${isPending ? "cs-secondary-card-pending" : ""}" data-aos="fade-up" data-aos-delay="${i * 100}">
          <div class="cs-secondary-card-header">
            <img src="${cs.logo}" alt="${cs.name} logo" class="cs-secondary-card-logo" />
            ${isPending ? `<span class="cs-secondary-card-badge">Coming soon</span>` : ""}
          </div>
          <h3 class="cs-secondary-card-name">${cs.name}</h3>
          <p class="cs-secondary-card-scope">${cs.scope}</p>
          ${
            isPending
              ? `<p class="cs-secondary-card-pending-note">Case study under preparation.</p>`
              : `<a href="/routes/case-studies/${cs.slug}" class="cs-secondary-card-cta">
                   Read story <i class="bi bi-arrow-right"></i>
                 </a>`
          }
        </div>`;
    })
    .join("");

  wrap.innerHTML = `
    <div class="cs-secondary-header">
      <span class="section-eyebrow">More stories</span>
      <h2 class="cs-secondary-heading">Other tutoring partners on <span class="gradient-text">Scorgi</span></h2>
    </div>
    <div class="cs-secondary-grid">${cards}</div>
  `;
  return wrap;
}
