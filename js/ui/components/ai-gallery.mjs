/**
 * AI Gallery Component
 * Apple-style fade gallery showcasing AI tools with tab navigation,
 * mock UI previews, sliding indicator, and captions.
 *
 * Reusable — call renderAIGallery(containerId) on any page.
 */

const defaultTools = [
  {
    icon: "bi-robot",
    tabLabel: "Chati",
    title: "Chati",
    description:
      "Live widget chats and AI phone calls in one hub. Chati answers with real-time lookups against each student\u2019s scores, sessions, and account \u2014 staff open any thread to read or reply.",
    image: "/images/scorgi-app/chati-hub.webp",
    imageAlt: "Chati Hub showing message and thread volume with the live chat and AI phone-call queue (names blurred)",
  },
  {
    icon: "bi-megaphone",
    tabLabel: "Ad Studio",
    title: "Ad Studio",
    description:
      "Plan a campaign, then build each post \u2014 AI drafts the plan, the copy, and the artwork for every scheduled slot, and attribution ties each ad back to booked revenue.",
    image: "/images/scorgi-app/ad-studio-studio.webp",
    imageAlt: "Ad Studio content planner with scheduled posts and one-click AI post building",
  },
  {
    icon: "bi-pen",
    tabLabel: "Essay",
    title: "Essay Copilot",
    description:
      "A dedicated college-essay tool at essaycopilot.com \u2014 built by the Foley Prep team and used by 5,700+ students to brainstorm, outline, and draft with AI while keeping the student\u2019s own voice.",
    image: "/images/scorgi-app/essay-copilot.webp",
    imageAlt: "Essay Copilot, the standalone college application essay tool, powered by OpenAI",
  },
  {
    icon: "bi-book",
    tabLabel: "Knowledge",
    title: "Knowledge Base",
    description:
      "Embeddings-powered Q&A over your handbook and policy entries. Describe a policy change and it finds every related entry by meaning, not just keywords.",
    image: "/images/scorgi-app/knowledge-base-2026-10.webp",
    imageAlt: "Communications Knowledge Base review queue: each question mined from client conversations gets a draft answer, tags, a confidence score, and related entries grouped by meaning",
  },
  {
    icon: "bi-lightning-charge",
    tabLabel: "Generator",
    title: "Problem Generator",
    description:
      "Create and validate practice problems with AI. Generate targeted content for any exam or topic.",
    mockType: "generator",
    mockHTML: `
      <div class="ai-mock-gen-header">Generated Problem</div>
      <div class="ai-mock-gen-q">If f(x) = 3x\u00B2 \u2212 5x + 2, what is f(\u22121)?</div>
      <div class="ai-mock-gen-options">
        <span class="ai-mock-gen-opt">A) 10</span>
        <span class="ai-mock-gen-opt ai-mock-gen-correct">B) 10</span>
        <span class="ai-mock-gen-opt">C) 0</span>
        <span class="ai-mock-gen-opt">D) \u22126</span>
      </div>
      <div class="ai-mock-gen-meta">SAT Math \u00B7 Quadratics \u00B7 Medium</div>`,
  },
  {
    icon: "bi-mic",
    tabLabel: "Voice",
    title: "Voice & Transcription",
    description:
      "Text-to-speech and speech-to-text for accessibility. Smart notes with AI-enhanced session documentation.",
    mockType: "voice",
    mockHTML: `
      <div class="ai-mock-waveform">
        <span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="ai-mock-transcript">
        <div class="ai-mock-transcript-line"><span class="ai-mock-ts">0:12</span> Student showed strong grasp of algebra concepts...</div>
        <div class="ai-mock-transcript-line"><span class="ai-mock-ts">0:45</span> Struggled with word problems involving rates...</div>
        <div class="ai-mock-transcript-line"><span class="ai-mock-ts">1:20</span> Recommended additional practice on unit conversions.</div>
      </div>`,
  },
  {
    icon: "bi-journal-text",
    tabLabel: "Lisan",
    title: "Lisan",
    description:
      "Session summarization with structured reports: overview, tasks, engagement, red flags, insights, and clarity assessment.",
    mockType: "report",
    mockHTML: `
      <div class="ai-mock-report-header">Session Summary</div>
      <div class="ai-mock-report-row"><span class="ai-mock-label">Engagement</span><span class="ai-mock-bar"><span style="width:85%"></span></span></div>
      <div class="ai-mock-report-row"><span class="ai-mock-label">Comprehension</span><span class="ai-mock-bar"><span style="width:72%"></span></span></div>
      <div class="ai-mock-report-row"><span class="ai-mock-label">Task Completion</span><span class="ai-mock-bar"><span style="width:90%"></span></span></div>
      <div class="ai-mock-report-row"><span class="ai-mock-label">Red Flags</span><span class="ai-mock-tag">None detected</span></div>`,
  },
];

/**
 * Build the gallery DOM and wire up tab switching.
 * @param {typeof defaultTools} tools
 * @returns {HTMLElement}
 */
export const createAIGallery = (tools = defaultTools) => {
  const gallery = document.createElement("div");
  gallery.className = "ai-gallery";

  // ---- Tab navigation ----
  const tabnav = document.createElement("div");
  tabnav.className = "ai-tabnav";
  const track = document.createElement("div");
  track.className = "ai-tabnav-track";

  const tabButtons = [];
  tools.forEach((tool, i) => {
    const btn = document.createElement("button");
    btn.className = `ai-tab${i === 0 ? " active" : ""}`;
    btn.setAttribute("data-ai-index", String(i));
    btn.innerHTML = `<i class="bi ${tool.icon}"></i><span>${tool.tabLabel}</span>`;
    track.appendChild(btn);
    tabButtons.push(btn);
  });

  const indicator = document.createElement("div");
  indicator.className = "ai-tabnav-indicator";
  track.appendChild(indicator);
  tabnav.appendChild(track);
  gallery.appendChild(tabnav);

  // ---- Preview viewport ----
  const viewport = document.createElement("div");
  viewport.className = "ai-gallery-viewport";

  const itemEls = [];
  tools.forEach((tool, i) => {
    const item = document.createElement("div");
    item.className = `ai-gallery-item${i === 0 ? " active" : ""}`;
    item.setAttribute("data-ai-index", String(i));

    const preview = document.createElement("div");
    preview.className = `ai-gallery-preview img-decorated${i % 2 === 1 ? " img-decorated-alt" : ""}`;
    if (tool.image) {
      // Real product capture — preferred over a hand-built mock.
      const shot = document.createElement("div");
      shot.className = "ai-gallery-shot";
      const img = document.createElement("img");
      img.src = tool.image;
      img.alt = tool.imageAlt || tool.title;
      // The first tab is visible on load; the rest can wait until switched to.
      img.loading = i === 0 ? "eager" : "lazy";
      img.decoding = "async";
      shot.appendChild(img);
      preview.appendChild(shot);
    } else {
      const mock = document.createElement("div");
      mock.className = `ai-gallery-mock ai-mock-${tool.mockType}`;
      mock.innerHTML = tool.mockHTML;
      preview.appendChild(mock);
    }
    item.appendChild(preview);

    viewport.appendChild(item);
    itemEls.push(item);
  });
  gallery.appendChild(viewport);

  // ---- Caption ----
  const caption = document.createElement("div");
  caption.className = "ai-gallery-caption text-center";
  const titleEl = document.createElement("h4");
  titleEl.textContent = tools[0].title;
  const descEl = document.createElement("p");
  descEl.textContent = tools[0].description;
  caption.appendChild(titleEl);
  caption.appendChild(descEl);
  gallery.appendChild(caption);

  // ---- Behaviour ----
  function moveIndicator(tab) {
    indicator.style.width = tab.offsetWidth + "px";
    indicator.style.left = tab.offsetLeft + "px";
  }

  function switchTab(index) {
    tabButtons.forEach((t) => t.classList.remove("active"));
    itemEls.forEach((it) => it.classList.remove("active"));
    tabButtons[index].classList.add("active");
    itemEls[index].classList.add("active");
    moveIndicator(tabButtons[index]);
    titleEl.textContent = tools[index].title;
    descEl.textContent = tools[index].description;
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(parseInt(btn.dataset.aiIndex)));
  });

  // Defer indicator init so the element is in the DOM and has dimensions
  requestAnimationFrame(() => {
    if (tabButtons.length) moveIndicator(tabButtons[0]);
  });

  window.addEventListener("resize", () => {
    const active = track.querySelector(".ai-tab.active");
    if (active) moveIndicator(active);
  });

  return gallery;
};

/**
 * Render the AI gallery into a container element.
 * @param {string} containerId
 * @param {typeof defaultTools | null} customTools
 */
export const renderAIGallery = (containerId, customTools = null) => {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id '${containerId}' not found`);
    return;
  }
  const el = createAIGallery(customTools || defaultTools);
  container.appendChild(el);
};

export { defaultTools };
