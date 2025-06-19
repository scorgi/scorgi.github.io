/**
 * Pricing Cards Component
 * Generates pricing plan cards with configurable features and prices
 */

export const createPricingCards = (plans = defaultPlans) => {
  const container = document.createElement("div");
  container.className = "row g-4 justify-content-center";

  plans.forEach((plan) => {
    const cardCol = document.createElement("div");
    cardCol.className = "col-lg-4 col-md-6 col-12";

    // Create card structure
    const card = document.createElement("div");
    const cardClasses = ["pricing-card", "h-100"];
    if (plan.isPopular) {
      cardClasses.push("pricing-card-popular");
    }
    card.className = cardClasses.join(" ");

    // Popular badge (if needed)
    if (plan.isPopular) {
      const popularBadge = document.createElement("div");
      popularBadge.className = "popular-badge";
      popularBadge.textContent = "Most Popular";
      card.appendChild(popularBadge);
    }

    // Plan header
    const planHeader = document.createElement("div");
    planHeader.className = "plan-header";

    const planName = document.createElement("h5");
    planName.className = "plan-name";
    planName.textContent = plan.name;

    const planPrice = document.createElement("div");
    planPrice.className = "plan-price";
    planPrice.textContent = plan.price;

    if (plan.period) {
      const periodSpan = document.createElement("span");
      periodSpan.textContent = plan.period;
      planPrice.appendChild(periodSpan);
    }

    planHeader.appendChild(planName);
    planHeader.appendChild(planPrice);

    // Features list
    const featuresList = document.createElement("ul");
    featuresList.className = "plan-features";

    plan.features.forEach((feature) => {
      const featureItem = document.createElement("li");
      featureItem.textContent = feature;
      featuresList.appendChild(featureItem);
    });

    // Button
    const button = document.createElement("button");
    button.className = "btn btnGradient w-100";
    button.textContent = plan.buttonText;

    // Assemble card
    card.appendChild(planHeader);
    card.appendChild(featuresList);
    card.appendChild(button);

    cardCol.appendChild(card);
    container.appendChild(cardCol);
  });

  return container;
};

/**
 * @param {string} containerId
 * @param {Array<{name: string, price: string, period: string, features: string[], buttonText: string, isPopular: boolean}>|null} customPlans
 */
export const renderPricingCards = (containerId, customPlans = null) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const plansData = customPlans || defaultPlans;
  const pricingCards = createPricingCards(plansData);

  container.appendChild(pricingCards);
};

// Default pricing plans data
const defaultPlans = [
  {
    name: "Individual Educator",
    price: "$?",
    period: "/month",
    features: ["Up to 25 students", "5 full-length practice tests", "Basic analytics dashboard", "Email support"],
    buttonText: "Get Started",
    isPopular: false,
  },
  {
    name: "Tutoring Company",
    price: "$?",
    period: "/month",
    features: ["Up to 100 students", "All 10 practice tests", "Advanced analytics & reporting", "Priority support", "White-label options"],
    buttonText: "Get Started",
    isPopular: true,
  },
  {
    name: "Educational Institution",
    price: "Custom",
    period: "",
    features: ["Unlimited students", "Full test library access", "Custom integrations", "Dedicated support team", "Training & onboarding"],
    buttonText: "Contact Sales",
    isPopular: false,
  },
];

export { defaultPlans };
