import { onReady, refreshAOS } from "../ui/page-init.mjs";
import { PRODUCT_UPDATES, formatUpdateMonth } from "../data/product-updates.mjs";

/** Escape text before it goes into innerHTML. */
const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/**
 * Render the updates timeline. The newest entry carries the "Latest" badge,
 * so the badge can never go stale the way a hardcoded one does.
 * @param {string} containerId
 */
function renderUpdates(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const sorted = [...PRODUCT_UPDATES].sort((a, b) => b.month.localeCompare(a.month));
  const newest = sorted[0]?.month;

  container.innerHTML = sorted
    .map((update) => {
      const isLatest = update.month === newest;
      const features = update.features
        .map(
          (f) =>
            `<div class="update-feature"><i class="bi bi-check-circle-fill text-success"></i> ${esc(f)}</div>`
        )
        .join("");

      return `
        <div class="update-entry" data-aos="fade-up">
          <div class="update-date">
            <span class="update-month">${esc(formatUpdateMonth(update.month))}</span>
            ${isLatest ? '<span class="update-badge update-badge-new">Latest</span>' : ""}
          </div>
          <div class="update-card">
            <h3 class="update-title">${esc(update.title)}</h3>
            <p class="update-desc">${esc(update.description)}</p>
            <div class="update-features">${features}</div>
          </div>
        </div>`;
    })
    .join("");
}

onReady(() => {
  renderUpdates("updates-timeline");
  refreshAOS();
});
