// @ts-check
import { BRAND, PRODUCTS, productsByCategory, PRODUCT_SLUGS, NAV_LINKS, MOBILE_NAV_LINKS } from "../config/site-data.mjs";

/**
 * Navbar Component — fully data-driven.
 * Add a product to PRODUCTS in site-data.mjs and it appears in the
 * desktop mega-menu AND mobile offcanvas automatically.
 */

// ─── Builders ────────────────────────────────────────────────────────────────

function buildMegaCol(label, products) {
  return `
    <div class="navbar-mega-col">
      <div class="navbar-mega-col-label">${label}</div>
      ${products
        .map(
          (p) => `
        <a class="navbar-mega-item" href="${p.href}" data-short="${p.shortTitle}">
          <i class="bi ${p.icon}"></i>
          <div><div class="navbar-mega-title">${p.title}</div></div>
        </a>`
        )
        .join("")}
    </div>`;
}

function buildDesktopNav() {
  const groups = productsByCategory();
  const megaCols = Object.entries(groups)
    .map(([label, items]) => buildMegaCol(label, items))
    .join("");

  const topLinks = NAV_LINKS.map(
    (l) => `<a class="navbar-nav-link" href="${l.href}">${l.label}</a>`
  ).join("");

  return `
    <div class="navbar-dropdown-wrapper">
      <a class="navbar-nav-link navbar-dropdown-trigger" href="/routes/features">Product<span class="navbar-dropdown-current" hidden></span> <i class="bi bi-chevron-down" style="font-size:0.65rem;margin-left:2px"></i></a>
      <div class="navbar-mega-menu">
        <div class="navbar-mega-cols navbar-mega-3col">${megaCols}</div>
      </div>
    </div>
    ${topLinks}`;
}

function buildMobileOffcanvas() {
  const mainLinks = MOBILE_NAV_LINKS.map(
    (l) => `<a class="mobile-nav-link" href="${l.href}"><i class="bi ${l.icon} me-2"></i>${l.label}</a>`
  ).join("");

  const subLinks = PRODUCTS.filter((p) => p.shortTitle !== "Updates")
    .map(
      (p) => `<a class="mobile-nav-sublink" href="${p.href}"><i class="bi ${p.icon}"></i>${p.shortTitle}</a>`
    )
    .join("");

  return `
    <div class="offcanvas offcanvas-end mobile-offcanvas" tabindex="-1" id="mobileNav" aria-labelledby="mobileNavLabel">
      <div class="offcanvas-header mobile-offcanvas-header">
        <a href="/" class="d-flex align-items-center text-decoration-none">
          <img src="${BRAND.logo}" alt="${BRAND.name}" style="width:36px;height:36px" />
          <span class="ms-2 fw-bold" style="font-family:'Outfit',sans-serif;font-size:1.15rem;color:#1d1d1f">${BRAND.name}</span>
        </a>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body mobile-offcanvas-body">
        <nav class="mobile-offcanvas-nav">${mainLinks}</nav>
        <div class="mobile-offcanvas-section">
          <div class="mobile-offcanvas-label">Product</div>
          <div class="mobile-nav-sub">${subLinks}</div>
        </div>
        <div class="mobile-offcanvas-cta">
          <a href="${BRAND.demoUrl}" class="btn btnGradient w-100">Book a Demo</a>
        </div>
      </div>
    </div>`;
}

// ─── Create & Init ───────────────────────────────────────────────────────────

export async function createNavbar() {
  const nav = document.createElement("nav");
  nav.className = "navbar fixed-top navbar-light navbar-scorgi";

  nav.innerHTML = `
    <div class="navbar-inner">
      <a class="navbar-brand m-0" href="/" style="cursor:pointer;display:flex;align-items:center;flex-shrink:0">
        <img src="${BRAND.logo}" alt="${BRAND.name} Logo" style="max-width:50px" />
      </a>
      <div class="navbar-center nav-desktop-only">${buildDesktopNav()}</div>
      <div class="navbar-right">
        <a class="navbar-nav-link navbar-contact nav-wide-only" href="mailto:${BRAND.email}"><i class="bi bi-envelope-fill"></i><span>Contact</span></a>
        <a class="btn btnGradient navbar-cta" href="${BRAND.demoUrl}">Book a Demo</a>
        <button class="navbar-toggler nav-compact-only" type="button" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-label="Open menu">
          <i class="bi bi-list" style="font-size:1.5rem;color:#1d1d1f"></i>
        </button>
      </div>
    </div>
    ${buildMobileOffcanvas()}`;

  return nav;
}

/**
 * Normalize a path or href for comparison: drop the origin, query, and hash,
 * lowercase it, and strip the trailing slash. "/routes/pricing/" and
 * "/routes/pricing" both become "/routes/pricing" so directory-index URLs
 * (which is what the server and GitHub Pages actually serve) still match.
 * @param {string} value
 */
function normalizePath(value) {
  if (!value) return "";
  const withoutOrigin = value.replace(/^https?:\/\/[^/]+/i, "");
  const withoutQuery = withoutOrigin.split(/[?#]/)[0].toLowerCase();
  return withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, "") : withoutQuery;
}

/**
 * True when `path` is `href` or lives underneath it, so nested pages such as
 * /routes/case-studies/foley-prep still light up their parent nav link.
 * @param {string} path
 * @param {string} href
 */
function isPathWithin(path, href) {
  if (!href || href === "/") return false;
  return path === href || path.startsWith(href + "/");
}

/** Mark the current page in the navbar: top-level links, mega items, and the Product trigger. */
function highlightActiveNav() {
  const path = normalizePath(window.location.pathname);

  /** @param {Element} el @param {string} cls @param {boolean} active */
  const setActive = (el, cls, active) => {
    el.classList.toggle(cls, active);
    if (active) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  };

  document.querySelectorAll(".navbar-center > a.navbar-nav-link").forEach((link) => {
    const href = normalizePath(link.getAttribute("href") || "");
    setActive(link, "navbar-nav-link-active", isPathWithin(path, href));
  });

  // Product mega-menu items — exact page match, so only one can win.
  let activeProduct = null;
  document.querySelectorAll(".navbar-mega-item").forEach((item) => {
    const href = normalizePath(item.getAttribute("href") || "");
    const active = path === href;
    setActive(item, "navbar-mega-item-active", active);
    if (active) activeProduct = item;
  });

  // Mirror the selection onto the Product trigger so a dropdown page still
  // reads as "you are here" while the menu is closed.
  const trigger = document.querySelector(".navbar-dropdown-trigger");
  if (trigger) {
    const featuresHref = normalizePath(trigger.getAttribute("href") || "");
    const onProductPage =
      Boolean(activeProduct) ||
      isPathWithin(path, featuresHref) ||
      PRODUCT_SLUGS.some((slug) => path === `/routes/${slug}`);
    trigger.classList.toggle("navbar-nav-link-active", onProductPage);
    if (onProductPage) trigger.setAttribute("aria-current", "true");
    else trigger.removeAttribute("aria-current");

    // Name the selected product next to "Product" so the highlight says which one.
    const label = trigger.querySelector(".navbar-dropdown-current");
    // Short name keeps the trigger compact ("Kiosk", not "Kiosk & Time Clock").
    const title = activeProduct?.getAttribute("data-short") || activeProduct?.querySelector(".navbar-mega-title")?.textContent?.trim() || "";
    if (label) {
      label.textContent = title;
      label.hidden = !title;
    }
  }

  // Mobile offcanvas mirrors the same state.
  document.querySelectorAll(".mobile-nav-link, .mobile-nav-sublink").forEach((link) => {
    const href = normalizePath(link.getAttribute("href") || "");
    const active = href === "/" ? path === "/" : isPathWithin(path, href);
    setActive(link, "mobile-nav-link-active", active);
  });
}

export function initializeNavbarBehavior() {
  if (window.screen && window.screen.width < 768) {
    const emailText = document.querySelector(".email-text");
    if (emailText) {
      emailText.innerHTML = '<i class="bi bi-envelope-fill mr-1"></i> Email Us!';
    }
  }

  highlightActiveNav();
  window.addEventListener("hashchange", highlightActiveNav);

  const mobileNav = document.getElementById("mobileNav");
  const navbar = document.querySelector(".navbar-scorgi");
  if (mobileNav && navbar) {
    let savedScrollY = 0;
    mobileNav.addEventListener("show.bs.offcanvas", () => {
      savedScrollY = window.scrollY;
      navbar.classList.add("navbar-offcanvas-open");
      document.body.classList.add("offcanvas-open");
      document.body.style.top = `-${savedScrollY}px`;
    });
    mobileNav.addEventListener("hide.bs.offcanvas", () => {
      navbar.classList.remove("navbar-offcanvas-open");
      document.body.classList.remove("offcanvas-open");
      document.body.style.top = "";
      window.scrollTo(0, savedScrollY);
    });
  }
}

export async function initializeNavbar() {
  const navbarPlaceholder = document.getElementById("navbar-placeholder");
  if (navbarPlaceholder) {
    const navbar = await createNavbar();
    navbarPlaceholder.replaceWith(navbar);
  } else {
    const navbar = await createNavbar();
    document.body.insertAdjacentElement("afterbegin", navbar);
  }
  initializeNavbarBehavior();
}
