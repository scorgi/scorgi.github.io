import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-check2-square", title: "Auto-Grading", description: "Students submit answers and receive their score instantly. No manual grading needed. Scaled scores, raw scores, and percentiles are calculated per-exam." },
  { icon: "bi-file-earmark-bar-graph", title: "Score Reports", description: "Beautiful, shareable score reports break down performance by section, question type, and difficulty level. Send them to parents with one click." },
  { icon: "bi-diagram-3-fill", title: "Topic Breakdowns", description: "See exactly which topics a student has mastered and which need work. Heatmaps highlight strengths and weaknesses at a glance." },
  { icon: "bi-search", title: "Question-Level Analysis", description: "Drill into individual questions to see time spent, answer changes, and which distractors were most tempting. Perfect for targeted review sessions." },
  { icon: "bi-map-fill", title: "Study Plans", description: "Scorgi generates a recommended study plan based on test results, target score, and exam date. Plans adjust automatically as new test data comes in." },
  { icon: "bi-shield-check", title: "QA Pipeline", description: "Every question goes through a multi-step review pipeline before it reaches students. Flag, review, and approve content with full audit trails." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
