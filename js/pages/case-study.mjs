// @ts-check
/**
 * Shared Case Study Page Initializer
 *
 * Each /routes/case-studies/{slug}/index.html declares its slug via
 * <meta name="case-study-slug" content="..."> and loads this script. The
 * script looks up the data and hands it to the page renderer.
 *
 * To add a new case study: add an entry to /js/data/case-studies.mjs and
 * copy an existing route folder, changing only the title, description,
 * and slug meta tag.
 */

import { onReady } from "../ui/page-init.mjs";
import { getCaseStudy } from "../data/case-studies.mjs";
import { renderCaseStudyPage } from "../ui/components/case-study-page.mjs";

onReady(() => {
  const slugMeta = document.querySelector('meta[name="case-study-slug"]');
  const slug = slugMeta?.getAttribute("content") || "";
  const data = getCaseStudy(slug);
  const mount = document.getElementById("case-study-main");

  if (!mount) {
    console.error("Case-study page is missing <main id=\"case-study-main\">");
    return;
  }
  if (!data) {
    console.error(`No case study registered for slug "${slug}"`);
    mount.innerHTML = `
      <section class="landing-section">
        <div class="container text-center">
          <h2>Case study not found</h2>
          <p class="text-body-secondary">Looking for one of our customer stories? <a href="/routes/case-studies/">See all case studies</a>.</p>
        </div>
      </section>`;
    return;
  }

  renderCaseStudyPage(data, mount);
});
