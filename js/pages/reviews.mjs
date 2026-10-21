import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-send-fill", title: "Auto Review Prompts", description: "After every session, Scorgi sends a personalized SMS or email asking the family to share their experience. No staff effort required." },
  { icon: "bi-clock-fill", title: "Smart Timing", description: "Prompts are sent at optimal times based on session satisfaction signals, time of day, and family engagement patterns to maximize response rates." },
  { icon: "bi-link-45deg", title: "Google / Yelp / Facebook Links", description: "Direct families to the review platform that matters most to your business. Rotate between Google, Yelp, and Facebook to build presence everywhere." },
  { icon: "bi-bar-chart-fill", title: "Review Analytics", description: "Track review volume, average rating, response rate, and sentiment over time. See which tutors generate the most positive feedback." },
  { icon: "bi-arrow-repeat", title: "SEO Feedback Loop", description: "Reviews are automatically monitored for SEO impact. Scorgi correlates review velocity with search ranking changes so you can see the flywheel turning." },
  { icon: "bi-speedometer2", title: "Reputation Dashboard", description: "One dashboard shows your rating across all platforms, highlights reviews that need responses, and flags negative sentiment for immediate attention." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
