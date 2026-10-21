import { onReady } from "../ui/page-init.mjs";
import { NEWSLETTERS, NEWSLETTERS_TOTAL, NEWSLETTERS_ARCHIVE_URL } from "../data/newsletters.mjs";

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const renderNewsletters = () => {
  const grid = document.getElementById("newsletter-cards");
  if (!grid) return;

  NEWSLETTERS.forEach((issue) => {
    const col = document.createElement("div");
    col.className = "col-lg-4 col-md-6 col-12";

    const link = document.createElement("a");
    link.href = issue.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "text-decoration-none";

    const card = document.createElement("div");
    card.className = "feature-card h-100 d-flex flex-column";
    card.style.overflow = "hidden";

    const thumbWrap = document.createElement("div");
    thumbWrap.style.cssText =
      "margin: -1.5rem -1.5rem 1rem; aspect-ratio: 16 / 9; overflow: hidden; background: #f5f5f7;";
    const thumb = document.createElement("img");
    thumb.src = issue.thumbnail;
    thumb.alt = issue.title;
    thumb.loading = "lazy";
    thumb.style.cssText = "width: 100%; height: 100%; object-fit: cover; object-position: top;";
    thumbWrap.appendChild(thumb);

    const date = document.createElement("p");
    date.className = "text-body-secondary mb-2";
    date.style.fontSize = "0.85rem";
    date.innerHTML = `<i class="bi bi-calendar3 me-1"></i>${formatDate(issue.date)}`;

    const title = document.createElement("h5");
    title.textContent = issue.title;

    const read = document.createElement("div");
    read.className = "mt-auto pt-3";
    read.innerHTML = '<span style="font-size: 0.85rem; color: var(--brand-primary); font-weight: 600;">Read the issue <i class="bi bi-arrow-right ms-1"></i></span>';

    card.appendChild(thumbWrap);
    card.appendChild(date);
    card.appendChild(title);
    card.appendChild(read);
    link.appendChild(card);
    col.appendChild(link);
    grid.appendChild(col);
  });

  const archiveLink = document.getElementById("newsletter-archive-link");
  if (archiveLink) {
    archiveLink.href = NEWSLETTERS_ARCHIVE_URL;
    archiveLink.textContent = `Browse All ${NEWSLETTERS_TOTAL} Issues`;
  }
  const count = document.getElementById("newsletter-count");
  if (count) count.textContent = `${NEWSLETTERS_TOTAL} issues and counting.`;
};

onReady();
renderNewsletters();
