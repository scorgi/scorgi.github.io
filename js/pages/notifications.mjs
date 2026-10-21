import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

// Grid 1: Four Channels (centered, 4-col)
const channels = [
  { icon: "bi-phone-vibrate", title: "Push", description: "VAPID web push for instant mobile and desktop alerts." },
  { icon: "bi-envelope", title: "Email", description: "Rich HTML emails for score reports, confirmations, and updates." },
  { icon: "bi-chat-dots", title: "SMS", description: "Twilio-powered text messages for reminders and urgent notices." },
  { icon: "bi-browser-chrome", title: "Browser", description: "In-app notifications for real-time updates on the platform." },
];

// Grid 2: Automated Features (3-col)
const automated = [
  { icon: "bi-lightning-charge", title: "Automated Triggers", description: "Session reminders, score reports, low balance alerts, cart confirmations, unread notes, session approvals/denials, and snow day closures — all fire automatically." },
  { icon: "bi-at", title: "@Mention System", description: "Tag users in notes and comments. Tagged users get instant push notifications so they never miss a conversation that needs their attention." },
  { icon: "bi-sliders2", title: "User Preferences", description: 'Hierarchical preference tree — users enable/disable each notification type per channel. "Send me session reminders by SMS but not email."' },
];

// Grid 3: Message Blast Targeting (3-col, accent cards)
const targeting = [
  { icon: "bi-calendar-range", title: "Session-Based Targeting", description: "Find all students with sessions in a date range, filtered by location, time window, and session type (in-person, remote, or both). Recipients auto-expand to include linked family members." },
  { icon: "bi-person-plus", title: "Custom List", description: "Hand-pick recipients with real-time name search, or bulk-paste user IDs. Shows total count including linked relations for accurate reach estimates." },
  { icon: "bi-funnel", title: "Query Builder", description: "Build complex recipient lists by combining session types, last active date, school, graduation year, attendance mode, lead status (Dead → Hot → Purchased), location, and role." },
];

// Grid 4: Workflow (3-col)
const workflow = [
  { icon: "bi-send", title: "Send Immediately", description: "Compose and send in one flow. Blasts begin delivery right away with per-recipient action logging." },
  { icon: "bi-clock", title: "Schedule for Later", description: "Pick a datetime and Scorgi delivers on schedule. Edit, cancel, or reschedule anytime before send." },
  { icon: "bi-file-earmark-text", title: "Save as Draft", description: "Draft-only permission tier lets team members compose without sending. Admins review and approve." },
  { icon: "bi-person-x", title: "Exclude Recipients", description: "Manually remove specific users after targeting. Fine-tune your audience before sending." },
  { icon: "bi-bar-chart-line", title: "Blast Analytics", description: "History of all blasts with per-blast stats: recipient count, emails sent, SMS sent, status, creator, and timestamps." },
  { icon: "bi-shield-lock", title: "Permission Tiers", description: "Draft-All (compose only) and Send-All (full access) permission levels for team safety." },
];

onReady(() => {
  renderFeatureCardGrid("channels-grid", channels, { columns: 4, centered: true });
  renderFeatureCardGrid("automated-grid", automated);
  renderFeatureCardGrid("targeting-grid", targeting, { accent: true });
  renderFeatureCardGrid("workflow-grid", workflow);
});
