// Import components
import { renderSuccessStories } from "./ui/components/success-story-cards.mjs";
import { renderPricingCards } from "./ui/components/pricing-cards.mjs";
import { renderFAQAccordion } from "./ui/components/faq-dropdown.mjs";

document.addEventListener("DOMContentLoaded", function () {
  // Existing intersection observer logic
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("come-in");
      }
    });
  });

  document.querySelectorAll(".banner-section .banner-image").forEach((img) => {
    observer.observe(img);
  });

  // Initialize AOS
  // @ts-expect-error - AOS is not defined in the global scope
  AOS.init({
    duration: 250,
    easing: "ease-in-out",
    once: false,
    mirror: true,
    offset: 120,
  });

  // Render components after DOM is loaded and AOS is initialized
  renderSuccessStories("success-stories-container");
  renderPricingCards("pricing-cards-container");
  renderFAQAccordion("faq-accordion-container");
});
