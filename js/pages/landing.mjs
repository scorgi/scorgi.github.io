import { onReady } from "../ui/page-init.mjs";
import { renderSuccessStories } from "../ui/components/success-story-cards.mjs";
import { renderFAQAccordion } from "../ui/components/faq-dropdown.mjs";
import { renderJourneySteps } from "../ui/components/journey-steps.mjs";
import { renderFeatureTabs } from "../ui/components/feature-tabs.mjs";
import { renderAIGallery } from "../ui/components/ai-gallery.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";
import { renderCaseStudies } from "../ui/components/case-study-cards.mjs";

const educatorCards = [
  { icon: "bi-kanban", title: "Benge — Kanban Boards", description: "Built-in project management with drag-and-drop cards, real-time WebSocket collaboration, due dates, checklists, comments, Gantt chart view, and Slack integration. Your team's tasks and the tutoring schedule in one platform." },
  { icon: "bi-calendar2-heart", title: "PTO System", description: "Dual vacation and sick day tracking with automatic accrual, balance projections, request workflows with admin approval, sick-to-PTO fallback, coverage credits, and usage analytics. Approved time off auto-creates schedule unavailability." },
  { icon: "bi-bell", title: "Notifications & Message Blast", description: "Four-channel automated notifications plus Message Blast — a built-in campaign tool with session-based targeting, query builder, AI content analysis, and dual email/SMS delivery. No Mailchimp needed." },
  { icon: "bi-palette", title: "White-Label Platform", description: "Your logo, colors, and domain. Multi-location management with GPS, role-based permissions (Admin, Manager, Staff, Client), and staff accounts. Give clients a seamless branded experience without writing code." },
];

const studentCards = [
  { icon: "bi-calendar-plus", title: "Client Scheduling", description: "Browse available 1-on-1 and group sessions, add to cart, and book instantly. Auto-checks service balances, validates payments, handles guardian linking for dependent accounts. Auto-approval for eligible bookings means less wait time." },
  { icon: "bi-speedometer2", title: "Personal Dashboard", description: "Schedule, scores, progress, invoices, and school lists — all in one place. Performance insights with topic-level analysis and AI-generated study recommendations from Chati." },
];

onReady(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("come-in");
    });
  });
  document.querySelectorAll(".banner-section .banner-image").forEach((img) => observer.observe(img));

  renderJourneySteps("journey-steps-container");
  renderFeatureTabs("feature-tabs-container");
  renderAIGallery("ai-gallery-container");
  renderFeatureCardGrid("educator-cards", educatorCards, { columns: 2 });
  renderFeatureCardGrid("student-cards", studentCards, { columns: 2 });
  renderSuccessStories("success-stories-container");
  renderCaseStudies("case-studies-container");
  renderFAQAccordion("faq-accordion-container");
});
