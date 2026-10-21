import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-chat-dots-fill", title: "Instant SMS", description: "When a lead fills out your form, Scorgi sends a personalized text within seconds introducing your company and asking how it can help." },
  { icon: "bi-telephone-fill", title: "Voice Calls", description: "If the lead does not reply to the text, Scorgi triggers an AI-powered voice call that sounds natural and collects key intake information." },
  { icon: "bi-robot", title: "AI Follow-Up", description: "Scorgi continues the conversation across multiple days, adjusting tone and timing based on lead behavior and response patterns." },
  { icon: "bi-signpost-split-fill", title: "Smart Routing", description: "Leads are routed to the right staff member based on subject, location, and availability. No more leads sitting in a shared inbox." },
  { icon: "bi-clock-history", title: "Conversation History", description: "Every text, call, and voicemail is logged in the CRM. When your team picks up the conversation, they have full context." },
  { icon: "bi-calendar-check-fill", title: "Auto-Booking", description: "Scorgi can book a free consultation directly from the SMS conversation, syncing with your calendar and sending confirmation links." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
