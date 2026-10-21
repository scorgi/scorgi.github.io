import { onReady } from "../ui/page-init.mjs";
import { renderSuccessStories } from "../ui/components/success-story-cards.mjs";

onReady(() => {
  renderSuccessStories("success-stories-container");
});
