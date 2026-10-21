import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-person-lines-fill", title: "Student Dashboards", description: "Every student gets a personalized dashboard showing test scores, session history, attendance, and progress toward their target score. Share it with parents in one click." },
  { icon: "bi-graph-up", title: "Score Trends & Heatmaps", description: "Visualize score progression over time with trend lines and heatmaps. Identify which topics are improving and which are plateauing at a glance." },
  { icon: "bi-diagram-3-fill", title: "Topic Breakdowns", description: "Drill into performance by topic, subtopic, and question type. See aggregate data across all students or zoom into one individual's strengths and weaknesses." },
  { icon: "bi-currency-dollar", title: "Revenue Reporting", description: "Track monthly recurring revenue, average revenue per student, package utilization, and outstanding balances. Export financial summaries for your accountant or investors." },
  { icon: "bi-calendar-check-fill", title: "Attendance Tracking", description: "Monitor session attendance rates by student, tutor, and location. Automatic no-show detection triggers follow-up messages and flags at-risk students." },
  { icon: "bi-sliders", title: "Custom Reports", description: "Build your own reports with drag-and-drop fields. Filter by date range, location, tutor, exam type, or student group. Schedule reports to be emailed weekly or monthly." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
