import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-chat-square-dots-fill", title: "Chati", description: "An AI assistant with real-time data lookups that can answer student questions, pull up session history, check schedules, and surface relevant practice materials mid-conversation." },
  { icon: "bi-megaphone-fill", title: "Ad Studio", description: "AI-assisted social ad production — campaign planning, copy generation, and image generation in one tab. Channel-level attribution then ties each ad back to the purchases it actually drove." },
  { icon: "bi-pencil-square", title: "Essay Copilot", description: "A college essay writing assistant that guides students through brainstorming, outlining, drafting, and revision. Provides feedback on structure, voice, and Common App alignment without writing the essay for them." },
  { icon: "bi-book-half", title: "Knowledge Base", description: "Embeddings-powered Q&A built from your company handbook, policies, and curriculum guides. Staff can ask natural-language questions and get instant answers sourced from your own documentation." },
  { icon: "bi-lightning-charge-fill", title: "Problem Generator", description: "AI-generated practice problems tailored to a student's weak areas and target exam. Generate unlimited practice sets with varying difficulty levels, complete with worked solutions and explanations." },
  { icon: "bi-mic-fill", title: "Voice & Transcription", description: "Speech-to-text transcription with AI-powered note generation. Record sessions (with consent), get automatic transcripts, and let AI extract key takeaways, action items, and parent-ready summaries." },
  { icon: "bi-journal-text", title: "Lisan", description: "Automatic session summarization with engagement metrics. After every tutoring session, Lisan generates a structured summary with topics covered, student engagement level, and recommended next steps." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards, { justifyCenter: true });
});
