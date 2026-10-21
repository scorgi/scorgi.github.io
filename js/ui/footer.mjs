// @ts-check
import { BRAND, FOOTER_PRODUCT_LINKS, FOOTER_COMPANY_LINKS, PARTNERS } from "../config/site-data.mjs";

/**
 * Footer Component — fully data-driven.
 * Links and partners come from site-data.mjs — update once, footer stays in sync.
 */

function buildLinkList(links) {
  return links
    .map((l) => `<li><a href="${l.href}" class="footer-link">${l.label}</a></li>`)
    .join("");
}

function buildPartnerLogos() {
  return PARTNERS.map(
    (p) => `<img src="${p.logo}" alt="${p.name}" class="footer-partner-logo" />`
  ).join("");
}

export async function createFooter() {
  const footer = document.createElement("footer");
  footer.className = "modern-footer mt-auto";

  footer.innerHTML = `
    <div class="footer-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="var(--brand-primary-lighter)"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="var(--brand-secondary-light)"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="var(--brand-primary-light)"></path>
      </svg>
    </div>

    <div class="footer-content">
      <div class="container-fluid p-0">
        <div class="row pt-2 pb-4 m-0">
          <!-- Logo + Tagline -->
          <div class="col-lg-3 col-md-6 col-12 text-center mb-4 mb-lg-0">
            <div class="footer-logo-section">
              <a href="/" class="footer-logo-link">
                <img src="${BRAND.logo}" alt="${BRAND.name} Logo" class="footer-logo" />
              </a>
              <h3 class="footer-brand-name">${BRAND.name}</h3>
              <p class="footer-tagline fw-bold">${BRAND.tagline}</p>
            </div>
          </div>

          <!-- Product Links -->
          <div class="col-lg-3 col-md-6 col-6 mb-4 mb-lg-0 text-center">
            <div class="footer-section">
              <h5 class="footer-section-title">Product</h5>
              <ul class="footer-links">${buildLinkList(FOOTER_PRODUCT_LINKS)}</ul>
            </div>
          </div>

          <!-- Company Links -->
          <div class="col-lg-3 col-md-6 col-6 mb-4 mb-lg-0 text-center">
            <div class="footer-section">
              <h5 class="footer-section-title">Company</h5>
              <ul class="footer-links">${buildLinkList(FOOTER_COMPANY_LINKS)}</ul>
            </div>
          </div>

          <!-- Contact -->
          <div class="col-lg-3 col-md-6 col-12 text-center">
            <div class="footer-section">
              <h5 class="footer-section-title">Contact</h5>
              <a href="mailto:${BRAND.email}" class="footer-email"><i class="bi bi-envelope me-2"></i>${BRAND.email}</a>
              <p class="footer-contact-text mt-3">Ready to grow your tutoring business?<br />Book a 20-minute demo with our team.</p>
              <a href="${BRAND.demoUrl}" class="footer-cta-link">Get Started <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>
        </div>

        <!-- Integrated With -->
        <div class="row py-3 border-top border-white border-opacity-20 m-0">
          <div class="col-12 text-center">
            <h6 class="footer-integrated-with-title">Integrated With</h6>
            <div class="footer-partners d-flex justify-content-center align-items-center flex-wrap gap-4">
              ${buildPartnerLogos()}
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom text-center py-3">
          <div class="row align-items-center m-0">
            <div class="col-md-6 mb-2 mb-md-0">
              <p class="footer-copyright mb-0">${BRAND.copyright}</p>
            </div>
            <div class="col-md-6">
              <p class="footer-disclaimer mb-0">${BRAND.disclaimer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  return footer;
}

export async function initializeFooter() {
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    const footer = await createFooter();
    footerPlaceholder.replaceWith(footer);
  } else {
    const footer = await createFooter();
    document.body.appendChild(footer);
  }
}
