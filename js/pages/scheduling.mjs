import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-people-fill", title: "Availability Matching", description: "Tutors set their weekly availability and subject expertise. When a student needs a session, Scorgi shows only the tutors who are qualified and free." },
  { icon: "bi-collection-fill", title: "Bootcamps & Group Classes", description: "Create multi-session bootcamps with capacity limits, waitlists, and automatic enrollment. Perfect for SAT prep intensives and summer programs." },
  { icon: "bi-geo-fill", title: "Multi-Location GPS", description: "Manage sessions across multiple physical locations. GPS check-ins verify tutor arrival and help parents track in-home session logistics." },
  { icon: "bi-calendar2-week-fill", title: "iCal Export", description: "Every tutor and student gets a personal iCal feed. Sessions appear in Google Calendar, Apple Calendar, or Outlook automatically with no manual entry." },
  { icon: "bi-stack", title: "Bulk Operations", description: "Reschedule an entire week of sessions in one click. Cancel snow days, shift holiday schedules, or reassign tutors in bulk without touching each session individually." },
  { icon: "bi-person-badge-fill", title: "Staff Assignment", description: "Assign tutors to students or let Scorgi auto-match based on subject, availability, and location. View staff utilization at a glance to balance workloads." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
