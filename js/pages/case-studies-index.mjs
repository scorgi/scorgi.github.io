// @ts-check
/**
 * Case Studies Index Page
 *
 * Renders a featured spotlight (the richest case study) plus a secondary
 * grid of teasers for everything else. Distinct visual treatment from
 * the home-page card row so the two pages don't feel duplicative.
 */

import { onReady } from "../ui/page-init.mjs";
import { renderCaseStudySpotlight } from "../ui/components/case-study-spotlight.mjs";

onReady(() => {
  renderCaseStudySpotlight("case-studies-container");
});
