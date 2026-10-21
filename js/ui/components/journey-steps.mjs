/**
 * Journey Steps Component
 * Renders the 6-step user journey funnel visualization
 */

const defaultSteps = [
  {
    number: 1,
    icon: "bi-search",
    title: "Get Found",
    label: "SEO & GEO",
    description: "Your tutoring business appears at the top of local search results. Google Business optimization, local SEO, and targeted visibility — so families find you first.",
    accent: "primary",
  },
  {
    number: 2,
    icon: "bi-door-open",
    title: "Get Them Through the Door",
    label: "Lead Capture",
    description: "Convert website visitors into booked consultations with white-label landing pages, lead forms, and automated follow-ups that never let a prospect slip away.",
    accent: "secondary",
  },
  {
    number: 3,
    icon: "bi-chat-dots",
    title: "Engage Instantly",
    label: "Communications",
    description: "Talk to every lead in under 60 seconds. Scorgi sends instant SMS and voice responses so prospects hear from you before they even finish browsing competitors.",
    accent: "primary",
  },
  {
    number: 4,
    icon: "bi-clipboard-check",
    title: "Grade the Test",
    label: "Instant Diagnostics",
    description: "Students take a diagnostic test and get results immediately. Auto-graded with score breakdowns by topic — no waiting, no manual scoring.",
    accent: "secondary",
  },
  {
    number: 5,
    icon: "bi-person-check",
    title: "Match with a Tutor",
    label: "Smart Scheduling",
    description: "Right after the diagnostic, match the student with the best-fit tutor and book their first session. Availability matching, instant booking, zero friction.",
    accent: "primary",
  },
  {
    number: 6,
    icon: "bi-star",
    title: "Earn the Review",
    label: "Review Collection",
    description: "Ask for reviews at the moment of highest satisfaction — right after a great session. Automated prompts drive 5-star reviews that fuel your SEO.",
    accent: "secondary",
  },
];

export const createJourneySteps = (steps = defaultSteps) => {
  const container = document.createElement("div");
  container.className = "journey-steps";

  steps.forEach((step, index) => {
    const stepEl = document.createElement("div");
    stepEl.className = `journey-step journey-step-${step.accent}`;
    // No data-aos on individual steps — parent container handles the animation
    // and AOS doesn't detect dynamically-added elements after init

    const numberEl = document.createElement("div");
    numberEl.className = "journey-step-number";
    numberEl.textContent = String(step.number);

    const iconEl = document.createElement("div");
    iconEl.className = "journey-step-icon";
    const icon = document.createElement("i");
    icon.className = `bi ${step.icon}`;
    iconEl.appendChild(icon);

    const contentEl = document.createElement("div");
    contentEl.className = "journey-step-content";

    const titleEl = document.createElement("h4");
    titleEl.className = "journey-step-title";
    titleEl.textContent = step.title;

    const labelEl = document.createElement("span");
    labelEl.className = `journey-step-label journey-step-label-${step.accent}`;
    labelEl.textContent = step.label;

    const descEl = document.createElement("p");
    descEl.className = "journey-step-desc";
    descEl.textContent = step.description;

    contentEl.appendChild(titleEl);
    contentEl.appendChild(labelEl);
    contentEl.appendChild(descEl);

    stepEl.appendChild(numberEl);
    stepEl.appendChild(iconEl);
    stepEl.appendChild(contentEl);

    container.appendChild(stepEl);

    // Add connector line between steps (not after last)
    if (index < steps.length - 1) {
      const connector = document.createElement("div");
      connector.className = "journey-connector";
      container.appendChild(connector);
    }
  });

  return container;
};

/**
 * @param {string} containerId
 * @param {Array<Object>|null} customSteps
 */
export const renderJourneySteps = (containerId, customSteps = null) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const stepsData = customSteps || defaultSteps;
  const stepsEl = createJourneySteps(stepsData);
  container.appendChild(stepsEl);
};

export { defaultSteps };
