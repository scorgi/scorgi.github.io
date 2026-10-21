/**
 * Success Story Cards Component
 * Renders verified Google reviews of Foley Prep (Scorgi's flagship
 * deployment) as testimonial cards. Review data lives in
 * js/data/reviews.mjs — real reviews only, never invented ones.
 */

import { REVIEWS, LOCATION_NAMES, REVIEWS_SOURCE } from "../../data/reviews.mjs";

const createStarsRow = (rating) => {
  const stars = document.createElement("div");
  stars.className = "d-flex gap-1 mb-2";
  for (let i = 0; i < 5; i++) {
    const star = document.createElement("i");
    star.className = i < rating ? "bi bi-star-fill" : "bi bi-star";
    star.style.color = "var(--brand-secondary)";
    stars.appendChild(star);
  }
  return stars;
};

export const createSuccessStoryCards = (reviews = REVIEWS) => {
  const container = document.createElement("div");
  container.className = "row g-4";

  reviews.forEach((review) => {
    const cardCol = document.createElement("div");
    cardCol.className = "col-lg-4 col-md-6 col-12";

    const card = document.createElement("div");
    card.className = "success-story-card h-100 d-flex flex-column";

    card.appendChild(createStarsRow(review.rating));

    const quoteP = document.createElement("p");
    quoteP.className = "story-quote flex-grow-1";
    quoteP.textContent = `"${review.text}"`;

    const nameH5 = document.createElement("h5");
    nameH5.className = "story-name mb-0";
    nameH5.textContent = review.author;

    const locationP = document.createElement("p");
    locationP.className = "story-school mb-2";
    locationP.textContent = `Foley Prep — ${LOCATION_NAMES[review.location] || review.location} · ${review.time}`;

    const verified = document.createElement("div");
    verified.className = "d-flex align-items-center gap-2";
    verified.style.cssText = "font-size: 0.8rem; color: #86868b;";
    verified.innerHTML = '<i class="bi bi-google"></i><span>Verified Google review</span>';

    card.appendChild(quoteP);
    card.appendChild(nameH5);
    card.appendChild(locationP);
    card.appendChild(verified);

    cardCol.appendChild(card);
    container.appendChild(cardCol);
  });

  return container;
};

/**
 * @param {string} containerId
 * @param {Array<{author: string, location: string, rating: number, time: string, text: string}>|null} customReviews
 */
export const renderSuccessStories = (containerId, customReviews = null) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  container.appendChild(createSuccessStoryCards(customReviews || REVIEWS));
};

export { REVIEWS as defaultStories, REVIEWS_SOURCE };
