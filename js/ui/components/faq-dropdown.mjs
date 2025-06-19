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
    question: "How does Scorgi differ from other SAT prep platforms?",
    answer: "Scorgi is built specifically for educators and tutors, not students. Our platform provides administrative tools, detailed analytics, and flexible content purchasing options that help professional instructors deliver better results.",
  },
  {
    question: "Can I purchase individual test sections?",
    answer: "Yes! Scorgi offers the flexibility to purchase full tests or individual sections (Reading, Writing, Math) based on your students' specific needs and your budget.",
  },
  {
    question: "Is there a setup fee or training required?",
    answer: "No setup fees! Individual and company plans include free onboarding. Educational institutions receive comprehensive training and dedicated support during implementation.",
  },
  {
    question: "How accurate are the practice tests compared to the real SAT?",
    answer: "Our practice tests are meticulously crafted by the same content creators behind New Jersey's leading tutoring companies. Students consistently report that our tests accurately reflect the difficulty and format of the actual SAT®.",
  },
];

export { defaultFAQs };
