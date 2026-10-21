import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-geo-alt-fill", title: "Local SEO", description: "Optimize your site structure, meta tags, and content for the neighborhoods and zip codes you serve. Scorgi auto-generates location pages so each area gets its own search footprint." },
  { icon: "bi-google", title: "Google Business Integration", description: "Manage your Google Business profile directly from Scorgi. Update hours, respond to reviews, post updates, and track impressions without leaving the dashboard." },
  { icon: "bi-graph-up-arrow", title: "Rank Tracking", description: "Monitor your position for target keywords across Google, Google Maps, and Bing. Weekly snapshots show whether your visibility is climbing or needs attention." },
  { icon: "bi-pin-map-fill", title: "Geo-Targeting", description: "Define service areas by radius or zip code. Scorgi tailors your landing pages, ads, and schema markup to the exact geography you want to dominate." },
  { icon: "bi-journal-check", title: "Citation Management", description: "Keep your NAP (Name, Address, Phone) consistent across 60+ directories. Scorgi scans for mismatches and submits corrections automatically." },
  { icon: "bi-arrow-repeat", title: "Review-to-SEO Loop", description: "Every new 5-star review strengthens your local ranking. Scorgi closes the loop by prompting happy families to leave reviews exactly when satisfaction is highest." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
