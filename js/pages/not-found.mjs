import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";
import { PRODUCTS } from "../config/site-data.mjs";

/**
 * 404 page. Renders the main destinations plus a full product index, so a
 * dead link still lands somewhere useful instead of a dead end.
 */

const destinations = [
  { icon: "bi-grid", title: "All Features", description: "The full walkthrough — from getting found in search to collecting the five-star review.", href: "/routes/features" },
  { icon: "bi-tag", title: "Pricing", description: "Plans for individual educators, tutoring companies, and institutions.", href: "/routes/pricing" },
  { icon: "bi-buildings", title: "Case Studies", description: "How real tutoring companies run day-to-day on Scorgi.", href: "/routes/case-studies/" },
  { icon: "bi-megaphone", title: "Product Updates", description: "What shipped recently, month by month.", href: "/routes/product-updates" },
  { icon: "bi-chat-quote", title: "Testimonials", description: "Verified reviews from families and educators.", href: "/routes/testimonials" },
  { icon: "bi-envelope", title: "Book a Demo", description: "A 20-minute walkthrough of the platform with our team.", href: "/routes/contact" },
];

/** Show the path that failed, so the user knows what didn't resolve. */
function showAttemptedPath() {
  const el = document.getElementById("error-path");
  if (!el) return;
  const path = window.location.pathname;
  if (!path || path === "/" || path === "/404.html") return;
  el.textContent = `No page at ${path}`;
  el.hidden = false;
}

/** Full product list, grouped by the same categories the navbar uses. */
function renderProductIndex(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = PRODUCTS.map(
    (p) => `
      <a class="error-product-link" href="${p.href}">
        <i class="bi ${p.icon}"></i>
        <span>${p.title}</span>
      </a>`
  ).join("");
}

onReady(() => {
  showAttemptedPath();
  // Cards carry their own links, so wrap each rendered card in its anchor.
  renderFeatureCardGrid("destinations-grid", destinations);
  document.querySelectorAll("#destinations-grid .feature-card").forEach((card, i) => {
    const href = destinations[i]?.href;
    if (!href) return;
    const link = document.createElement("a");
    link.href = href;
    link.className = "error-card-link";
    card.replaceWith(link);
    link.appendChild(card);
  });
  renderProductIndex("product-index");
});
