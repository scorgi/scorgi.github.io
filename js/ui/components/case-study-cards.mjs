// @ts-check
/**
 * Case Study Cards Component
 * Renders verified-partner cards with graceful fallback:
 *   - Always shows logo, partner name, scope tagline, and "Read case study" CTA.
 *   - Quote and metric render only when present — no placeholder text ships
 *     until the partner has signed off on real content.
 *
 * Default card data is derived from /js/data/case-studies.mjs so adding a
 * new case study to the registry automatically surfaces it on the home page
 * and the /routes/case-studies/ index.
 *
 * Replaces the thin "Trusted By" logo strip with depth-over-breadth proof.
 */

import { ALL_CASE_STUDIES } from "../../data/case-studies.mjs";

/**
 * @typedef {{
 *   name: string,
 *   logo: string,
 *   scope: string,
 *   href: string,
 *   url?: string,
 *   quote?: string,
 *   attribution?: string,
 *   metricValue?: string,
 *   metricLabel?: string,
 * }} CaseStudyData
 */

/**
 * @param {CaseStudyData[]} studies
 * @returns {HTMLElement}
 */
export const createCaseStudyCards = (studies) => {
  const row = document.createElement("div");
  row.className = "row g-4 justify-content-center";

  studies.forEach((study, index) => {
    const col = document.createElement("div");
    col.className = "col-lg-6 col-md-10 col-12";
    col.setAttribute("data-aos", "fade-up");
    col.setAttribute("data-aos-delay", String(index * 100));

    const card = document.createElement("div");
    card.className = "case-study-card section-glass h-100";

    // Header: logo + name + scope
    const header = document.createElement("div");
    header.className = "case-study-card-header";
    header.innerHTML = `
      <img src="${study.logo}" alt="${study.name} logo" class="case-study-card-logo" />
      <div class="case-study-card-heading">
        <h5 class="case-study-card-name">${study.name}</h5>
        <p class="case-study-card-scope text-body-secondary">${study.scope}</p>
      </div>
    `;
    card.appendChild(header);

    // Optional quote
    if (study.quote) {
      const quote = document.createElement("blockquote");
      quote.className = "case-study-card-quote";
      quote.innerHTML = `
        <p class="mb-2">&ldquo;${study.quote}&rdquo;</p>
        ${study.attribution ? `<footer class="case-study-card-attribution text-body-secondary">— ${study.attribution}</footer>` : ""}
      `;
      card.appendChild(quote);
    }

    // Optional metric
    if (study.metricValue) {
      const metric = document.createElement("div");
      metric.className = "case-study-card-metric";
      metric.innerHTML = `
        <span class="case-study-card-metric-value gradient-text">${study.metricValue}</span>
        ${study.metricLabel ? `<span class="case-study-card-metric-label text-body-secondary">${study.metricLabel}</span>` : ""}
      `;
      card.appendChild(metric);
    }

    // CTA
    const cta = document.createElement("a");
    cta.className = "btn-outline-glass case-study-card-cta";
    cta.href = study.href;
    cta.textContent = "Read case study";
    card.appendChild(cta);

    col.appendChild(card);
    row.appendChild(col);
  });

  return row;
};

/**
 * @param {string} containerId
 * @param {CaseStudyData[]} [customStudies]
 */
export const renderCaseStudies = (containerId, customStudies) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const data = customStudies && customStudies.length ? customStudies : defaultStudies;
  container.appendChild(createCaseStudyCards(data));
};

// Default cards are derived from the case-study registry. Anything in the
// registry shows up here automatically; teaser-only fields (quote/metric)
// are picked up from the registry's `quote` and `metrics[0]` when present.
const defaultStudies = ALL_CASE_STUDIES.map((cs) => ({
  name: cs.name,
  logo: cs.logo,
  scope: cs.scope,
  href: `/routes/case-studies/${cs.slug}`,
  url: cs.url,
  quote: cs.quote?.text,
  attribution: cs.quote?.attribution,
  metricValue: cs.metrics?.[0]?.value,
  metricLabel: cs.metrics?.[0]?.label,
}));

export { defaultStudies };
