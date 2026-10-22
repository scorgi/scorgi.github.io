/**
 * FAQ Dropdown Component
 * Generates accordion-style FAQ sections with configurable questions and answers
 */

export const createFAQAccordion = (faqs = defaultFAQs, accordionId = "faqAccordion") => {
  const container = document.createElement("div");
  container.className = "accordion";
  container.id = accordionId;

  faqs.forEach((faq, index) => {
    const faqItem = document.createElement("div");
    faqItem.className = "accordion-item";

    const isFirstItem = index === 0;

    // Create accordion header
    const headerH2 = document.createElement("h2");
    headerH2.className = "accordion-header";

    const button = document.createElement("button");
    button.className = isFirstItem ? "accordion-button" : "accordion-button collapsed";
    button.type = "button";
    button.setAttribute("data-bs-toggle", "collapse");
    button.setAttribute("data-bs-target", `#faq${index + 1}`);
    button.textContent = faq.question;

    headerH2.appendChild(button);

    // Create accordion body
    const collapseDiv = document.createElement("div");
    collapseDiv.id = `faq${index + 1}`;
    collapseDiv.className = isFirstItem ? "accordion-collapse collapse show" : "accordion-collapse collapse";
    collapseDiv.setAttribute("data-bs-parent", `#${accordionId}`);

    const bodyDiv = document.createElement("div");
    bodyDiv.className = "accordion-body";
    bodyDiv.textContent = faq.answer;

    collapseDiv.appendChild(bodyDiv);

    // Assemble FAQ item
    faqItem.appendChild(headerH2);
    faqItem.appendChild(collapseDiv);

    container.appendChild(faqItem);
  });

  return container;
};

/**
 * @param {string} containerId
 * @param {Array<{question: string, answer: string}>|null} customFAQs
 * @param {string} customAccordionId
 */
export const renderFAQAccordion = (containerId, customFAQs = null, customAccordionId = "faqAccordion") => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const faqsData = customFAQs || defaultFAQs;
  const faqAccordion = createFAQAccordion(faqsData, customAccordionId);

  container.appendChild(faqAccordion);
};

// Default FAQ data
const defaultFAQs = [
  {
    question: "How does Scorgi differ from platforms like Noto?",
    answer: "Tools like Noto, Teachworks, and TutorCruncher focus on running lessons: scheduling, billing, and client communication. Scorgi does that too, and adds the teaching and growth layer: a built-in practice-test engine, topic-level progress boards and parent summaries, SEO and lead intake, Communications for lead engagement, and review collection. Plus a management dashboard, content creation tools, Kanban boards, employee time off tracking, and built-in AI tools.",
  },
  {
    question: "What does the Insights Dashboard show?",
    answer: "The Insights Dashboard shows topic-level skill tiers (Beginner through Mastery) calculated from accuracy, speed, and difficulty. You'll see trend indicators (Improving, Declining, Stable), staleness warnings for unpracticed topics, and speed risk alerts. Tutors can view combined analytics across up to 8 students and generate targeted worksheets directly from the dashboard.",
  },
  {
    question: "Can students track college applications?",
    answer: "Yes! The School Tracker lets students search thousands of schools, filter by acceptance rate, tuition, and SAT/ACT fit, and track applications through 8 statuses with deadlines and checklists. It includes a fit analysis algorithm (Likely, Match, Reach), drag-and-drop rankings with a podium view, a 4-year cost estimator, and secure share tokens for parents and counselors.",
  },
  {
    question: "Is there a setup fee or training required?",
    answer: "No setup fees! Every plan includes hands-on onboarding where our team configures your branding, locations, staff accounts, pricing models, and content library. Educational institutions receive comprehensive training and dedicated support.",
  },
  {
    question: "How accurate are the practice tests?",
    answer: "Our practice tests are meticulously crafted through an 8-stage QA pipeline. Every problem goes through creation, review, 2+ expert approvals, and production verification. Students consistently report that our tests accurately reflect the difficulty and format of the actual SAT®, ACT, HSPT, and other exams.",
  },
  {
    question: "Can I create my own test content?",
    answer: "Absolutely. The Content Creation Platform includes a Problem Editor, Test Editor, QA Tool with 11 issue categories, a Kanban-style production pipeline, and a Shared HTML Editor with MathJax support. Problems follow an 8-stage lifecycle from draft through immutable (locked after 10+ student responses).",
  },
];

export { defaultFAQs };
