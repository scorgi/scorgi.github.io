/**
 * Screenshot Frame Component
 * Wraps any image in a branded frame with decorative green/orange
 * gradient glow, corner swoops, and macOS-style window chrome.
 *
 * Usage — add data-src to any existing placeholder:
 *   <div class="screenshot-placeholder"
 *        data-src="https://cdn.example.com/my-image.png"
 *        data-title="Dashboard">
 *     <i class="bi bi-speedometer2"></i><span>Dashboard Preview</span>
 *   </div>
 *
 * It gets auto-replaced with the branded frame on page load.
 */

/**
 * Create a screenshot frame element.
 * @param {string} src - Image URL
 * @param {string} [title] - Optional title in the window bar
 * @param {string} [alt] - Alt text for the image
 * @returns {HTMLElement}
 */
export function createScreenshotFrame(src, title = "", alt = "") {
  const frame = document.createElement("div");
  frame.className = "screenshot-frame";

  const inner = document.createElement("div");
  inner.className = "screenshot-frame-inner";

  // Window chrome bar
  inner.innerHTML = `
    <div class="screenshot-frame-bar">
      <span class="screenshot-frame-dot screenshot-frame-dot-red"></span>
      <span class="screenshot-frame-dot screenshot-frame-dot-yellow"></span>
      <span class="screenshot-frame-dot screenshot-frame-dot-green"></span>
      ${title ? `<span class="screenshot-frame-title">${title}</span>` : ""}
    </div>`;

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt || title || "Screenshot";
  img.loading = "lazy";
  inner.appendChild(img);

  // Orange accent swoop (bottom-right)
  const accent = document.createElement("div");
  accent.className = "screenshot-frame-accent";

  frame.appendChild(inner);
  frame.appendChild(accent);

  return frame;
}

/**
 * Auto-upgrade any .screenshot-placeholder that has a data-src attribute.
 * Placeholders without data-src are left as-is.
 */
export function upgradeScreenshots() {
  document.querySelectorAll(".screenshot-placeholder[data-src]").forEach((el) => {
    const src = el.getAttribute("data-src");
    const title = el.getAttribute("data-title") || "";
    const alt = el.getAttribute("data-alt") || "";
    if (!src) return;

    const frame = createScreenshotFrame(src, title, alt);

    // Preserve extra classes from the original (like banner-image)
    el.classList.forEach((cls) => {
      if (cls !== "screenshot-placeholder") frame.classList.add(cls);
    });

    el.replaceWith(frame);
  });
}
