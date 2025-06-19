/**
 * Success Story Cards Component
 * Generates success story cards with student testimonials and score improvements
 */

export const createSuccessStoryCards = (stories = defaultStories) => {
  const container = document.createElement("div");
  container.className = "row g-4";

  stories.forEach((story) => {
    const cardCol = document.createElement("div");
    cardCol.className = "col-lg-4 col-md-6 col-12";

    // Create card structure
    const card = document.createElement("div");
    card.className = "success-story-card h-100";

    // Score badge
    const scoreDiv = document.createElement("div");
    scoreDiv.className = "story-score";
    scoreDiv.textContent = `+${story.scoreIncrease} Points`;

    // Student name
    const nameH5 = document.createElement("h5");
    nameH5.className = "story-name";
    nameH5.textContent = story.name;

    // School
    const schoolP = document.createElement("p");
    schoolP.className = "story-school";
    schoolP.textContent = story.school;

    // Quote
    const quoteP = document.createElement("p");
    quoteP.className = "story-quote";
    quoteP.textContent = `"${story.quote}"`;

    // Score improvement
    const improvementDiv = document.createElement("div");
    improvementDiv.className = "story-improvement";
    improvementDiv.textContent = `${story.beforeScore} → ${story.afterScore}`;

    // Assemble card
    card.appendChild(scoreDiv);
    card.appendChild(nameH5);
    card.appendChild(schoolP);
    card.appendChild(quoteP);
    card.appendChild(improvementDiv);

    cardCol.appendChild(card);
    container.appendChild(cardCol);
  });

  return container;
};

/**
 * @param {string} containerId
 * @param {Array<{name: string, school: string, scoreIncrease: number, beforeScore: number, afterScore: number, quote: string}>|null} customStories
 */
export const renderSuccessStories = (containerId, customStories = null) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const storiesData = customStories || defaultStories;
  const storiesCards = createSuccessStoryCards(storiesData);

  container.appendChild(storiesCards);
};

// Default success stories data
const defaultStories = [
  {
    name: "Sarah M.",
    school: "Ridge High School",
    scoreIncrease: 240,
    beforeScore: 1180,
    afterScore: 1420,
    quote: "Scorgi's detailed feedback helped me identify exactly where I needed to improve. The practice tests felt just like the real thing!",
  },
  {
    name: "Marcus T.",
    school: "Holmdel High School",
    scoreIncrease: 190,
    beforeScore: 1210,
    afterScore: 1400,
    quote: "The scheduling tools made it easy for my tutor to track my progress. I knew exactly what to focus on each week.",
  },
  {
    name: "Emma L.",
    school: "Watchung Hills Regional",
    scoreIncrease: 170,
    beforeScore: 1290,
    afterScore: 1460,
    quote: "Being able to practice individual sections helped me target my weakest areas without wasting time.",
  },
];

export { defaultStories };
