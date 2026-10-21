import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-pencil-square", title: "Problem Editor", description: "Author problems with full metadata, content fields, solutions, and detailed rationales. Each problem moves through an 8-stage lifecycle from Incomplete to Immutable, ensuring quality at every step." },
  { icon: "bi-file-earmark-ruled", title: "Test Editor", description: "Build tests with multiple timed sections, configure scoring rules, use templates for rapid assembly, and set monetization options — all from a single interface." },
  { icon: "bi-shield-check", title: "QA Tool", description: "Flag issues across 11 categories. Requires 2+ reviewer consensus before a problem advances. Feedback is tracked per reviewer so authors can learn and improve." },
  { icon: "bi-kanban", title: "Production Manager", description: "A Kanban-style pipeline organized by tag with status badges and bottleneck detection. See where content is stuck and keep your production line moving." },
  { icon: "bi-code-slash", title: "Shared HTML Editor", description: "Create reusable content blocks with MathJax support and CDN-hosted media. Usage tracking shows exactly where each block appears across your content library." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
