import { onReady } from "../ui/page-init.mjs";
import { renderPricingCards } from "../ui/components/pricing-cards.mjs";
import { renderFAQAccordion } from "../ui/components/faq-dropdown.mjs";

const pricingFAQs = [
  {
    question: "Is there a free trial?",
    answer: "We offer a guided onboarding period where we set up your entire platform — branding, locations, staff, and content. Book a demo to get started and see Scorgi in action before committing.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle, and we'll prorate any differences.",
  },
  {
    question: "What's included in onboarding?",
    answer: "Every plan includes hands-on onboarding where our team configures your branding, locations, staff accounts, pricing models, and content library. Enterprise plans include dedicated training sessions for your team.",
  },
  {
    question: "Do you charge per student or per test?",
    answer: "No per-student or per-test fees. Each plan includes a set number of students and tests. You always know exactly what you'll pay each month.",
  },
  {
    question: "Is there a long-term contract?",
    answer: "No long-term contracts required. All plans are month-to-month. We earn your business every month by delivering results.",
  },
];

onReady(() => {
  renderPricingCards("pricing-cards-container");
  renderFAQAccordion("pricing-faq-container", pricingFAQs, "pricingFaqAccordion");
});
