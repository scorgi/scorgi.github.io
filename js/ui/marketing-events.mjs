/** Provider-neutral events. No network calls, contact fields, or full URLs. */
const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const STORAGE_KEY = 'scorgi_campaign_session';
export function campaignFromSearch(search) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(KEYS.flatMap(key => {
    const value = params.get(key);
    // Campaign labels only; reject email addresses, URLs, and free-form data.
    return value && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? [[key, value]] : [];
  }));
}
export function getCampaign() {
  try {
    const current = campaignFromSearch(location.search);
    if (Object.keys(current).length) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    }
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return campaignFromSearch(new URLSearchParams(saved).toString());
  } catch { return campaignFromSearch(location.search); }
}
export function track(event, properties = {}) {
  // Explicit allowlist prevents accidental forwarding of contact information.
  const allowed = ['placement', 'chapter', 'mode', 'reason', 'percent'];
  const safe = Object.fromEntries(Object.entries(properties).filter(([key]) => allowed.includes(key)));
  const detail = {event, ...safe, page_path: location.pathname, ...getCampaign()};
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(detail);
  window.dispatchEvent(new CustomEvent('scorgi:marketing', {detail}));
}
export function initMarketingEvents() {
  getCampaign();
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname.replace(/\/$/, '') === '/routes/contact') {
      // Carry source through navigation even where sessionStorage is unavailable.
      for (const [key, value] of Object.entries(getCampaign())) url.searchParams.set(key, value);
      link.href = url.href;
      track('demo_cta_click', {placement: link.dataset.track || 'site_navigation'});
    } else if (link.dataset.track) {
      track('product_link_click', {placement: link.dataset.track});
    }
  });
}
