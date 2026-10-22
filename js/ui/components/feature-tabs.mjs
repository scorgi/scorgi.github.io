/**
 * Feature Tabs Component
 * Noto-style tabbed feature showcase with left nav and right content panel
 */

const defaultFeatures = [
  {
    icon: "bi-search",
    title: "SEO & GEO",
    heading: "Get found by families near you.",
    description: "Local search optimization, Google Business integration, and geo-targeted visibility. Scorgi makes sure your tutoring business ranks first when families search in your area — driving organic leads on autopilot.",
    image: "/images/foley-prep/home.webp",
    link: "/routes/seo-geo",
  },
  {
    icon: "bi-chat-dots",
    title: "Communications",
    heading: "Respond to leads in under 60 seconds.",
    description: "Instant SMS and voice responses to every new lead. Scorgi engages prospects immediately, while they are still comparing options.",
    image: "/images/scorgi-app/communications-inbox.webp",
    link: "/routes/communications",
  },
  {
    icon: "bi-clipboard-check",
    title: "Practice Tests",
    heading: "Auto-graded diagnostics, instant results.",
    description: "Full-length SAT, ACT, HSPT, SSAT, ISEE, GRE, GMAT, LSAT, and MCAT tests with auto-grading, diagnostic score reports, and topic-level breakdowns. Students get results the moment they finish.",
    image: "/images/scorgi-app/scorgi-goja-cropped.webp",
    link: "/routes/test-engine",
  },
  {
    icon: "bi-calendar-check",
    title: "Scheduling",
    heading: "Staff and client scheduling, unified.",
    description: "Staff view schedules in Calendar or Table mode with 5 operating modes (View, Add, Edit, Move, Cancel). Clients browse available sessions, add to cart, and book instantly. Availability matching, demand heatmaps, and Selectat bulk-scheduling — all built in.",
    image: "/images/scorgi-app/scorgi-schedule-staff-2026-10.webp",
    link: "/routes/scheduling",
  },
  {
    icon: "bi-tablet-landscape",
    title: "Kiosk & Time Clock",
    heading: "A front desk that runs itself.",
    description: "Students check themselves in on a lobby tablet with two taps, and staff clock in and out with a quick photo or face match. Hours, average start time, and on-time rate add themselves up.",
    image: "/images/scorgi-app/kiosk-check-in-2026-10.webp",
    link: "/routes/kiosk",
  },
  {
    icon: "bi-bar-chart-line",
    title: "Insights",
    heading: "Topic-level skill tiers and trend analysis.",
    description: "See Beginner, Intermediate, Advanced, and Mastery tiers per topic — calculated from accuracy, speed, and difficulty. Trend indicators show Improving, Declining, or Stable. Staleness warnings flag unpracticed topics. Group mode analyzes up to 8 students with intersection analysis.",
    image: "/images/foley-prep/progress-board-wide-2026-10.webp",
    link: "/routes/insights",
  },
  {
    icon: "bi-star",
    title: "Reviews",
    heading: "Turn happy students into 5-star reviews.",
    description: "Automated review prompts sent at the moment of highest satisfaction — right after a great session. Direct links to Google, Yelp, and Facebook. More reviews mean better SEO rankings, which means more students. The full loop.",
    image: "/images/foley-prep/testimonials-cards.webp",
    link: "/routes/reviews",
  },
  {
    icon: "bi-robot",
    title: "AI Suite",
    heading: "7 AI tools, zero extra cost.",
    description: "Chati (smart assistant), Ad Studio (AI ad planning, copy and imagery), Essay Copilot, Knowledge Base, Problem Generator, Voice & Transcription, and Lisan — intelligence built into every interaction.",
    image: "/images/scorgi-app/chati-hub.webp",
    link: "/routes/ai-suite",
  },
  {
    icon: "bi-speedometer2",
    title: "Dashboard",
    heading: "Complete visibility into your business.",
    description: "Action logs, session management, lead pipeline with 5 stages, lead scoring, revenue attribution by source, abandoned cart recovery, Stripe checkout tracking, and contact list exports. Everything an owner needs in one view.",
    image: "/images/scorgi-app/management-overview-2026-10.webp",
    link: "/routes/dashboard",
  },
  {
    icon: "bi-mortarboard",
    title: "School Tracker",
    heading: "Find the right school, track every application.",
    description: "Browse thousands of schools with fit analysis (Likely, Match, Reach). Track 8 application statuses with deadlines, checklists, and intended majors. Drag-and-drop podium rankings, cost estimator, and secure share tokens for parents and counselors.",
    image: "/images/scorgi-app/school-search.webp",
    link: "/routes/school-tracker",
  },
  {
    icon: "bi-cart-check",
    title: "Commerce",
    heading: "Get paid without the hassle.",
    description: "Stripe checkout, flexible packages, 529 plan support, digital waivers, receipts, invoicing, and service balance tracking. Clients purchase tutoring hours and the system automatically validates balances against session costs.",
    image: "/images/scorgi-app/scorgi-pricing-model.webp",
    link: "/routes/commerce",
  },
  {
    icon: "bi-palette",
    title: "White-Label",
    heading: "Your brand, your platform.",
    description: "Your logo, colors, and domain. Multi-location management with GPS, role-based permissions (Admin, Manager, Staff, Client), and staff accounts. Give clients a seamless branded experience without writing code.",
    image: "/images/scorgi-app/brand-kit-2026-10.webp",
    link: "/routes/white-label",
  },
  {
    icon: "bi-pencil-square",
    title: "Content Creation",
    heading: "Create, review, and publish test content.",
    description: "Problem Editor, Test Editor, QA Tool with 11 issue categories, Kanban production pipeline, and Shared HTML Editor with MathJax. Problems follow an 8-stage lifecycle with multi-reviewer consensus.",
    image: "/images/scorgi-app/content-creation-dashboard-2026-10.webp",
    link: "/routes/content-creation",
  },
  {
    icon: "bi-kanban",
    title: "Benge Kanban",
    heading: "Project management built for education.",
    description: "Drag-and-drop Kanban boards with rich cards, due dates, checklists, comments, and assigned members. Real-time WebSocket collaboration, Gantt chart view, Slack integration, and full audit trail.",
    image: "/images/scorgi-app/benge-kanban.webp",
    link: "/routes/benge",
  },
  {
    icon: "bi-calendar2-heart",
    title: "Employee Time Off System",
    heading: "Staff leave management on autopilot.",
    description: "Dual vacation and sick day tracking with automatic accrual, balance projections, request workflows, sick-to-PTO fallback, coverage credits, and usage analytics. Approved time off auto-creates schedule unavailability.",
    image: "/images/scorgi-app/pto-balance-2026-10.webp",
    link: "/routes/pto",
  },
  {
    icon: "bi-bell",
    title: "Notifications & Blast",
    heading: "Notifications plus built-in campaigns.",
    description: "Four-channel automated notifications (push, email, SMS, browser) plus Message Blast — a full campaign tool with session-based targeting, query builder, AI content analysis, and dual email/SMS delivery. No Mailchimp needed.",
    image: "/images/scorgi-app/comms-analytics.webp",
    link: "/routes/notifications",
  },
];

export const createFeatureTabs = (features = defaultFeatures) => {
  const wrapper = document.createElement("div");
  wrapper.className = "ftabs";

  // Left: tab list
  const tabList = document.createElement("div");
  tabList.className = "ftabs-nav";

  const navHeader = document.createElement("div");
  navHeader.className = "ftabs-nav-header";
  navHeader.textContent = "What we offer";
  tabList.appendChild(navHeader);

  // Two-column grid for tabs
  const navGrid = document.createElement("div");
  navGrid.className = "ftabs-nav-grid";
  tabList.appendChild(navGrid);

  /** @type {HTMLButtonElement[]} */ const tabs = [];
  /** @type {HTMLElement[]} */ const panels = [];

  features.forEach((feature, index) => {
    const tab = document.createElement("button");
    tab.className = `ftabs-tab${index === 0 ? " ftabs-tab-active" : ""}`;
    tab.setAttribute("data-ftab-index", String(index));
    tab.setAttribute("type", "button");
    tab.setAttribute("aria-expanded", index === 0 ? "true" : "false");

    const iconWrap = document.createElement("div");
    iconWrap.className = "ftabs-tab-icon";
    const icon = document.createElement("i");
    icon.className = `bi ${feature.icon}`;
    iconWrap.appendChild(icon);

    const titleSpan = document.createElement("span");
    titleSpan.className = "ftabs-tab-title";
    titleSpan.textContent = feature.title;

    const arrow = document.createElement("i");
    arrow.className = "bi bi-arrow-right ftabs-tab-arrow";

    tab.appendChild(iconWrap);
    tab.appendChild(titleSpan);
    tab.appendChild(arrow);

    tab.addEventListener("click", () => activate(index));

    tabs.push(tab);
    navGrid.appendChild(tab);
  });

  // Right: content panels
  const contentArea = document.createElement("div");
  contentArea.className = "ftabs-content";

  features.forEach((feature, index) => {
    const panel = document.createElement("div");
    panel.className = `ftabs-panel${index === 0 ? " ftabs-panel-active" : ""}`;
    panel.setAttribute("data-ftab-panel", String(index));

    // Text block (fixed at top)
    const textBlock = document.createElement("div");
    textBlock.className = "ftabs-panel-text";

    const heading = document.createElement("h3");
    heading.className = "ftabs-panel-heading";
    heading.textContent = feature.heading;

    const desc = document.createElement("p");
    desc.className = "ftabs-panel-desc";
    desc.textContent = feature.description;

    textBlock.appendChild(heading);
    textBlock.appendChild(desc);
    panel.appendChild(textBlock);

    // Visual block (fills remaining height, image anchored to bottom)
    const visualBlock = document.createElement("div");
    visualBlock.className = "ftabs-panel-visual";

    const altClass = index % 2 === 1 ? " img-decorated-alt" : "";

    if (feature.image) {
      const imgWrap = document.createElement("div");
      imgWrap.className = `ftabs-panel-image img-decorated${altClass}`;
      const img = document.createElement("img");
      img.src = feature.image;
      img.alt = feature.title;
      img.loading = "lazy";
      imgWrap.appendChild(img);
      visualBlock.appendChild(imgWrap);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = `ftabs-panel-placeholder img-decorated${altClass}`;
      const placeholderIcon = document.createElement("i");
      placeholderIcon.className = `bi ${feature.icon}`;
      placeholder.appendChild(placeholderIcon);
      const placeholderText = document.createElement("span");
      placeholderText.textContent = "Screenshot coming soon";
      placeholder.appendChild(placeholderText);
      visualBlock.appendChild(placeholder);
    }

    panel.appendChild(visualBlock);
    panels.push(panel);
    contentArea.appendChild(panel);
  });

  wrapper.appendChild(tabList);
  wrapper.appendChild(contentArea);

  // ─── Selection ─────────────────────────────────────────────────────────────
  // Desktop keeps the two-column tabs layout. Below lg the panel is moved to sit
  // directly under its own tab (accordion), so tapping a row reveals its content
  // in place instead of changing something further down the page, off-screen.

  const isAccordion = () => wrapper.classList.contains("ftabs-accordion");

  /** Expand an accordion panel to its natural height, re-measuring once images land. */
  function expand(panel) {
    panel.style.maxHeight = panel.scrollHeight + "px";
    panel.querySelectorAll("img").forEach((img) => {
      if (img.complete) return;
      img.addEventListener(
        "load",
        () => {
          if (panel.classList.contains("ftabs-panel-active")) {
            panel.style.maxHeight = panel.scrollHeight + "px";
          }
        },
        { once: true }
      );
    });
  }

  /**
   * @param {number} index
   * @param {{ toggle?: boolean, scroll?: boolean }} [opts]
   */
  function activate(index, opts = {}) {
    const { toggle = true, scroll = true } = opts;
    const accordion = isAccordion();
    const alreadyOpen = tabs[index].classList.contains("ftabs-tab-active");

    // In accordion mode a second tap on the open row closes it.
    if (accordion && alreadyOpen && toggle) {
      tabs[index].classList.remove("ftabs-tab-active");
      tabs[index].setAttribute("aria-expanded", "false");
      panels[index].classList.remove("ftabs-panel-active");
      panels[index].style.maxHeight = "";
      return;
    }

    tabs.forEach((t, i) => {
      const on = i === index;
      t.classList.toggle("ftabs-tab-active", on);
      t.setAttribute("aria-expanded", String(on && accordion));
    });
    panels.forEach((pn, i) => {
      const on = i === index;
      pn.classList.toggle("ftabs-panel-active", on);
      if (!accordion) pn.style.maxHeight = "";
      else if (!on) pn.style.maxHeight = "";
    });

    if (accordion) {
      expand(panels[index]);
      if (scroll) {
        // Collapsing the previously open panel shifts everything below it up,
        // which can carry the tapped row off-screen. Re-check once the
        // max-height transition has settled, then bring it back under the
        // fixed navbar if it has drifted out of comfortable view.
        const NAV_OFFSET = 88;
        window.setTimeout(() => {
          const rect = tabs[index].getBoundingClientRect();
          if (rect.top < NAV_OFFSET || rect.top > window.innerHeight * 0.55) {
            window.scrollTo({
              top: window.scrollY + rect.top - NAV_OFFSET,
              behavior: "smooth",
            });
          }
        }, 360);
      }
    }
  }

  // ─── Responsive layout swap ────────────────────────────────────────────────
  const mq = window.matchMedia("(max-width: 991.98px)");

  function applyLayout() {
    const wantAccordion = mq.matches;
    if (wantAccordion === isAccordion()) return;

    if (wantAccordion) {
      tabs.forEach((tab, i) => tab.insertAdjacentElement("afterend", panels[i]));
      wrapper.classList.add("ftabs-accordion");
    } else {
      panels.forEach((pn) => {
        pn.style.maxHeight = "";
        contentArea.appendChild(pn);
      });
      wrapper.classList.remove("ftabs-accordion");
    }

    const current = tabs.findIndex((t) => t.classList.contains("ftabs-tab-active"));
    activate(current >= 0 ? current : 0, { toggle: false, scroll: false });
  }

  applyLayout();
  if (mq.addEventListener) mq.addEventListener("change", applyLayout);
  else mq.addListener(applyLayout); // Safari < 14

  // scrollHeight is 0 while the wrapper is still detached, so the caller
  // re-runs this once the element is actually in the document.
  wrapper.ftabsMeasure = () => {
    if (!isAccordion()) return;
    const current = tabs.findIndex((t) => t.classList.contains("ftabs-tab-active"));
    activate(current >= 0 ? current : 0, { toggle: false, scroll: false });
  };

  // Re-measure the open panel when the viewport changes width.
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isAccordion()) return;
      const open = panels.find((pn) => pn.classList.contains("ftabs-panel-active"));
      if (open) open.style.maxHeight = open.scrollHeight + "px";
    }, 150);
  });

  return wrapper;
};

/**
 * @param {string} containerId
 * @param {Array<Object>|null} customFeatures
 */
export const renderFeatureTabs = (containerId, customFeatures = null) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }

  const data = customFeatures || defaultFeatures;
  const tabsEl = createFeatureTabs(data);
  container.appendChild(tabsEl);
  // Now that it is in the document, panels can be measured for the open height.
  if (typeof tabsEl.ftabsMeasure === "function") tabsEl.ftabsMeasure();
};

export { defaultFeatures };
