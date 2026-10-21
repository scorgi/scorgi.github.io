import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  {
    icon: "bi-building",
    title: "Multi-Location Management",
    description: "Each location gets its own staff roster, schedule, and student list while sharing a single billing and reporting layer. GPS-based check-ins verify tutor arrivals. Staff can be assigned to specific locations or float between them.",
    listItems: [
      "Location-specific schedules and capacity",
      "GPS check-in for in-person sessions",
      "Cross-location staff assignments",
      "Centralized reporting across all sites",
    ],
  },
  {
    icon: "bi-shield-lock-fill",
    title: "Role-Based Permissions",
    description: "Four permission tiers ensure everyone sees exactly what they need and nothing they should not. Permissions are fully customizable per role and per location.",
    listItems: [
      "Admin — Full platform access, billing, and settings",
      "Manager — Staff management, scheduling, and reporting",
      "Staff — Own schedule, student notes, and session tools",
      "Client — Student portal, scores, and payment history",
    ],
  },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards, { columns: 2 });
});
