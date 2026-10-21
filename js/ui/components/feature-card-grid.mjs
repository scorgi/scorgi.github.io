/**
 * Feature Card Grid Component
 * Renders a responsive grid of feature cards with alternating green/orange icons.
 * Supports centered layouts, accent borders, and nested feature lists.
 *
 * Icons automatically alternate primary (green) and secondary (orange).
 * AOS fade-up delays stagger across columns.
 */

/**
 * @typedef {{
 *   icon: string,
 *   title: string,
 *   description: string,
 *   listItems?: string[],
 * }} FeatureCardData
 *
 * @typedef {{
 *   columns?: number,
 *   centered?: boolean,
 *   accent?: boolean,
 *   justifyCenter?: boolean,
 * }} GridOptions
 */

/**
 * @param {FeatureCardData[]} cards
 * @param {GridOptions} [options]
 * @returns {HTMLElement}
 */
export const createFeatureCardGrid = (cards, options = {}) => {
  const cols = options.columns ?? 3;
  const centered = options.centered ?? false;
  const accent = options.accent ?? false;

  const colClass =
    cols === 2 ? "col-md-6 col-12" :
    cols === 4 ? "col-lg-3 col-md-6 col-12" :
    "col-md-6 col-lg-4";

  const row = document.createElement("div");
  // justifyCenter centres a trailing partial row (e.g. 7 cards in a 3-col grid).
  row.className = options.justifyCenter ? "row g-4 justify-content-center" : "row g-4";

  cards.forEach((card, index) => {
    const isSecondary = index % 2 === 1;
    const delay = (index % cols) * 100;

    const col = document.createElement("div");
    col.className = colClass;
    col.setAttribute("data-aos", "fade-up");
    col.setAttribute("data-aos-delay", String(delay));

    // Card classes
    const cardClasses = ["feature-card", "h-100"];
    if (centered) cardClasses.push("text-center", "align-items-center");
    if (accent) cardClasses.push(isSecondary ? "feature-card-accent-secondary" : "feature-card-accent");

    // Icon classes — margin-bottom is already in the .icon-container CSS
    const iconClasses = ["icon-container"];
    if (isSecondary) iconClasses.push("icon-container-secondary");

    // Build card HTML
    let cardHTML = `
      <div class="${cardClasses.join(" ")}">
        <div class="${iconClasses.join(" ")}"><i class="bi ${card.icon}"></i></div>
        <h5>${card.title}</h5>
        <p>${card.description}</p>`;

    // Optional nested feature list
    if (card.listItems && card.listItems.length) {
      cardHTML += `<ul class="feature-list mt-2">`;
      card.listItems.forEach((item) => {
        cardHTML += `<li><i class="bi bi-check-circle-fill text-success me-2"></i>${item}</li>`;
      });
      cardHTML += `</ul>`;
    }

    cardHTML += `</div>`;
    col.innerHTML = cardHTML;
    row.appendChild(col);
  });

  return row;
};

/**
 * Render a feature card grid into a container.
 *
 * @param {string} containerId
 * @param {FeatureCardData[]} cards
 * @param {GridOptions} [options]
 */
export const renderFeatureCardGrid = (containerId, cards, options = {}) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }
  if (!cards || !cards.length) {
    console.error(`No card data provided for #${containerId}`);
    return;
  }
  container.appendChild(createFeatureCardGrid(cards, options));
};
