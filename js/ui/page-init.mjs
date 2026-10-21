/**
 * Page Initialization Utility
 * Eliminates duplicated AOS setup, background SVG, and CDN loading across every page.
 *
 * Usage in any page script:
 *   import { onReady } from "../ui/page-init.mjs";
 *   onReady(() => { // page-specific setup });
 */

import { upgradeScreenshots } from "./components/screenshot-frame.mjs";

const AOS_CSS = "https://cdn.jsdelivr.net/npm/aos@2.3.1/dist/aos.css";
const AOS_JS  = "https://cdn.jsdelivr.net/npm/aos@2.3.1/dist/aos.js";

/**
 * Load a CSS file if not already in the document.
 * @param {string} href
 */
function ensureCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Load a JS file if not already in the document. Returns a promise.
 * @param {string} src
 * @returns {Promise<void>}
 */
function ensureScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

/**
 * Inject the animated background SVG that every page uses.
 * Safe to call multiple times — skips if already present.
 */
function injectBackgroundSVG() {
  if (document.getElementById("backgroundColor")) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = "backgroundColor";
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  svg.setAttribute("viewBox", "10 10 80 80");

  const paths = [
    { fill: "var(--brand-primary-lighter)", cls: "out-top", d: "M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z" },
    { fill: "var(--brand-primary-light)", cls: "in-top", d: "M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z" },
    { fill: "var(--brand-secondary-lighter)", cls: "out-bottom", d: "M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z" },
    { fill: "var(--brand-secondary-light)", cls: "in-bottom", d: "M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z" },
  ];

  for (const p of paths) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", p.fill);
    path.setAttribute("class", p.cls);
    path.setAttribute("d", p.d);
    path.style.animationPlayState = "running";
    svg.appendChild(path);
  }

  const navbar = document.querySelector("#navbar-placeholder, .navbar-scorgi");
  if (navbar && navbar.nextSibling) {
    navbar.parentNode.insertBefore(svg, navbar.nextSibling);
  } else {
    document.body.prepend(svg);
  }
}

/**
 * Load AOS library (CSS + JS) and initialize with standard site config.
 */
async function initAOS() {
  // CSS stays in <head> to prevent FOUC on [data-aos] elements.
  // JS is loaded dynamically so pages don't need the <script> tag.
  ensureCSS(AOS_CSS);
  // @ts-expect-error
  if (typeof AOS === "undefined") {
    await ensureScript(AOS_JS);
  }
  // @ts-expect-error
  AOS.init({ duration: 600, easing: "ease-out", once: false, mirror: true, offset: 80 });
}

/**
 * Re-initializes AOS to detect dynamically-added [data-aos] elements.
 * AOS.refresh() only recalculates positions of already-tracked elements —
 * it does NOT scan for new DOM nodes. Re-running AOS.init() does.
 */
export function refreshAOS() {
  // @ts-expect-error
  if (typeof AOS !== "undefined") {
    // @ts-expect-error
    AOS.init({ duration: 600, easing: "ease-out", once: false, mirror: true, offset: 80 });
  }
}

/**
 * Run a callback after DOM is ready, with standard site-wide setup
 * (background SVG + AOS) already applied.
 *
 * @param {() => void} [pageSetup] - Optional page-specific initialization
 * @param {{ skipBackground?: boolean }} [options]
 */
export function onReady(pageSetup, options = {}) {
  const run = async () => {
    if (!options.skipBackground) injectBackgroundSVG();
    await initAOS();
    upgradeScreenshots();
    if (pageSetup) pageSetup();
    refreshAOS();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}
