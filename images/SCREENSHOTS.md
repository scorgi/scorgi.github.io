# Screenshot Inventory & Placeholder Mapping

Updated 2026-09-07. Sources:

- `images/scorgi-app/` — Scorgi app UI captured from **dev.foleyprep.com** while logged in as
  robw@foleyprep.com. All wired-in files are 1600px WebP.
- `images/foley-prep/` — public foleyprep.com pages (Scorgi's production deployment).
  PNG originals kept alongside the WebP versions used on the site.

Client names visible in `lead-pipeline.webp` and `commerce-open-carts.webp` are **blurred**
(originals with names never entered the repo; only blurred versions are here).

## Wired-in mapping (current)

| Page / spot | Image | Shows |
|---|---|---|
| index hero | `scorgi-app/staff-dashboard.webp` | Staff dashboard — the Quick Links app grid (Users, Records, Tests, schedules, Insights, Content Creation, School Tracker, Benge, Management Tools, Employee Time Off) |
| index — Management Dashboard row | `scorgi-app/management-overview-2026-10.webp` | Management Tools overview (needs-attention + at-a-glance) |
| index — Content Creation row | `scorgi-app/content-creation-dashboard-2026-10.webp` | Content Creation dashboard (QA queue, tests) |
| index — School Tracker row | `scorgi-app/school-search.webp` | School Tracker browse (1,037 colleges) |
| dashboard — Action Logs | `scorgi-app/actions-chart.webp` | Action logs time-series chart |
| dashboard — Lead Pipeline | `scorgi-app/lead-pipeline.webp` | Opportunities pipeline (names blurred) |
| dashboard — Commerce | `scorgi-app/commerce-open-carts.webp` | Open carts + unrealized revenue (names blurred) |
| benge — Kanban Board | `scorgi-app/benge-kanban.webp` | Live board — **card titles blurred** (internal); columns, labels, stars, avatars, dates intact |
| benge — Real-Time Collaboration | `scorgi-app/benge-collab.webp` | Multi-assignee cards — **card titles blurred** |
| pto — Balance Dashboard | `scorgi-app/pto-balance-2026-10.webp` | Balance overview with the Balance-Over-Time projection chart |
| pto — Request Workflow | `scorgi-app/pto-request-2026-10.webp` | Request Time Off form (type, date range, coverage) |
| school-tracker — School Search | `scorgi-app/school-search.webp` | Browse schools |
| school-tracker — Fit Analysis | `scorgi-app/school-fit-cards.webp` | School cards with acceptance/SAT/tuition |
| school-tracker — Rankings & Sharing | `scorgi-app/school-rankings.webp` | My Schools leaderboard view — top-3 podium plus the numbered remainder. Cropped to the top-schools block only; the cost-estimator table below it made the image too tall for the two-column row |
| ai-suite — Integrated | `scorgi-app/ad-studio-studio.webp` | Ad Studio content planner with per-slot AI post building |
| index — AI gallery / Chati | `scorgi-app/chati-hub.webp` | Real Chati Hub — message/thread/call volume and the live queue (**names blurred**; message bodies are redacted by the app itself) |
| index — AI gallery / Knowledge | `scorgi-app/knowledge-base-2026-10.webp` | Real Knowledge Base — handbook batch linking and semantic policy search |
| index — AI gallery / Ad Studio | `scorgi-app/ad-studio-studio.webp` | Ad Studio content planner |
| white-label — Brand Customization | `scorgi-app/brand-kit-2026-10.webp` | Branding style-guide page (fonts, logos) |
| white-label — Staff Dashboard | `scorgi-app/scorgi-dashboard.webp` | Staff dashboard |
| analytics — Student Progress | `scorgi-app/insights-2026-10.webp` | Insights mastery dashboard (populated) |
| analytics — Business Analytics | `scorgi-app/action-logs.webp` | Actions-by-type table |
| insights — Skill Tiers | CDN `buy-dsat/insights.png` | Insights mastery dashboard |
| insights — Worksheet Generator | `scorgi-app/insights-worksheet-2026-10.webp` | Insights Worksheet Mode (tier columns, student picker) |
| content-creation — Problem Lifecycle | `scorgi-app/content-creation-dashboard-2026-10.webp` | Content Creation dashboard |
| features — Lead Conversion | `foley-prep/get-started-form.webp` | foleyprep.com lead funnel |
| features — Review Collection | `foley-prep/testimonials-cards.webp` | Verified Google reviews wall |
| reviews — SEO Flywheel | `foley-prep/reviews-wall.webp` | Six real Google reviews with ratings and score increases |
| seo-geo — Review-to-SEO Loop | `foley-prep/reviews-wall.webp` | Same review wall — the content that feeds local ranking |
| features — Communications (Step 3) | `scorgi-app/communications-thread.webp` | Real Communications conversation with a Chati-handled call, recording + transcript (**contact names blurred**) |
| communications — Late-Night Lead | `scorgi-app/communications-thread.webp` | Same capture |
| features — SEO & GEO (Step 1) | `scorgi-app/ad-studio-analytics.webp` | Ad Studio analytics (dollar figures blurred) |
| notifications — The Composer | `scorgi-app/message-blast.webp` | Message Blast composer + live email/SMS preview (no real recipients) |
| test-engine — Score Reports | `foley-prep/score-results.webp` | Public live results: students improved, avg increase by exam, initial vs best (anonymized by the site itself) |
| index — AI gallery / Essay | `scorgi-app/essay-copilot.webp` | Hero of the real Essay Copilot product site (essaycopilot.com) |
| seo-geo — Ad Studio | `scorgi-app/ad-studio-analytics.webp` | Ad Studio analytics — **all dollar figures blurred**; impressions, clicks, CTR, conversions, ROAS kept |

## Still placeholder / needs replacing

None — every `screenshot-placeholder` on the site now resolves to a real capture.

The School Tracker shot was taken by tracking six well-known colleges to the admin's own
My Schools list, capturing the leaderboard view, then removing all six (verified back to 0).
Everything visible is public College Scorecard data plus that seeded list — no student data.

## Blur policy

Two committed images carry deliberate blur, applied as a mask composite over the original capture:

- `scorgi-app/benge-*.webp` — card titles only. Internal ticket titles are company information;
  columns, labels, star ratings, team avatars, comment counts, and dates are left readable.
- `scorgi-app/ad-studio-analytics.webp` — absolute dollar amounts only (ad spend, conversion value,
  cost per conversion, the reality-check line, and the chart's money axis). Ratios and volumes
  (ROAS, impressions, clicks, CTR, conversions) are left readable: they read as social proof without
  disclosing revenue.
- `scorgi-app/chati-hub.webp` — contact names only. The app already renders message bodies as
  "[redacted message body — N characters]", so nothing else needed masking.
- `scorgi-app/communications-thread.webp` — contact names in the sidebar, thread header, and message
  senders, plus one un-redacted body. Call durations, AI badges, transcript state and staff
  avatars are left readable.

## Unused but kept for future spots

`scorgi-app/scorgi-goja-cropped.webp` (test engine problem view), `scorgi-app/scorgi-pricing-model.webp`
(service categories admin), `scorgi-app/scorgi-schedule-staff-2026-10.webp` (staff scheduling calendar),
`scorgi-app/performance-dashboard.webp` (quarterly grades — replaced as the hero but still useful),
all of `images/foley-prep/` (shop, catalog, results, digital tests, locations, login, home, contact,
events, faq, team, testimonials).

## October 2026 public captures (foleyprep.com)

Captured 2026-10-20 at 2x from public foleyprep.com pages with a headless browser (no login, no forms
submitted), exported as 1600px WebP. Progress images use Foley Prep's published example student
("Jordan"); the results crop shows only aggregate tiles, not the per-student table.

| Image | Source page | Used on |
|---|---|---|
| `foley-prep/progress-board-2026-10.webp` | /tutoring/progress (topic board) | video |
| `foley-prep/progress-board-wide-2026-10.webp` | top crop of the above | index (Insights row), insights hero row, case study |
| `foley-prep/progress-summary-2026-10.webp` | /tutoring/progress (parent summary) | insights "For Families", analytics, video |
| `foley-prep/progress-question-detail-2026-10.webp` | /tutoring/progress (question drill-down) | insights "For Families" |
| `foley-prep/test-demo-question-2026-10.webp` | /goja/demo (question 1, answer + review flag) | test-engine "Live Demo", video |
| `foley-prep/intake-quiz-2026-10.webp` | /about/get-started | features Step 2, video |
| `foley-prep/results-live-2026-10.webp` | /about/results (aggregate tiles) | test-engine Score Reports |
| `foley-prep/locations-map-2026-10.webp` | /location/locations | white-label Multi-Location |
| `foley-prep/team-stats-2026-10.webp` | /team (faculty stats band) | not yet placed |

The product video (`videos/scorgi-overview-{wide,square,vertical}.mp4`) and the social card
(`images/og/scorgi-og.png`) are built from these and the app captures above; rebuild the video with
`python3 scripts/build-marketing-video.py`.

## October 2026 app recapture (dev.foleyprep.com)

Recaptured 2026-10-20 at 2x from dev.foleyprep.com in a logged-in headless browser, read-only
(nothing saved, sent, or booked). Redaction was applied in the page before capture, so no
unredacted original was saved to the repo. The site's top contact bar, nav, chat widget, and footer
are hidden in every shot.

| File | Screen | Privacy treatment |
|---|---|---|
| `scorgi-app/content-creation-dashboard-2026-10.webp` | Content Creation home: review queue, drafts, contribution stats | None needed (test names and counts only) |
| `scorgi-app/scorgi-schedule-staff-2026-10.webp` | Staff Schedule, daily view, Warren, Sat 10/17 | Tutor names in column headers blurred; cards show class names only |
| `scorgi-app/client-booking-locations-2026-10.webp` | Family booking app: choose a location | None needed (public location photos) |
| `scorgi-app/company-calendar-2026-10.webp` | Company Calendar, October 2026 | None needed (official test dates only); stuck "Loading" legend hidden |
| `scorgi-app/management-overview-2026-10.webp` | Management Tools overview (needs attention / at a glance) | Every count and sidebar badge blurred |
| `scorgi-app/knowledge-base-2026-10.webp` | Communications Knowledge Base (/communication/thumper/knowledge): review queue, current entry, related-by-meaning | Generic FAQ entries only; automated email/phone scan of the page found none |
| `scorgi-app/pto-balance-2026-10.webp` | PTO overview: balances + balance-over-time chart | Cropped above Balance Activity, which holds personal notes |
| `scorgi-app/pto-request-2026-10.webp` | PTO request form | Empty form |
| `scorgi-app/brand-kit-2026-10.webp` | Branding: Brand Kit logos | None needed |
| `scorgi-app/insights-2026-10.webp` / `insights-board-full.webp` | Insights for a QA test account | Test account; display name replaced with "Sample Student", ID removed |
| `scorgi-app/insights-worksheet-2026-10.webp` | Worksheet Mode with four topics added (not saved) | Same test account |

Dev data note: the dev database has classes but almost no enrollments, so staff-schedule cards read
"0 / 5". A production capture (with student names blurred) would show filled, colored sessions.

Video-only asset: `foley-prep/progress-summary-mobile-2026-10.webp` is the same public parent summary
captured at phone width (430px), used for the Parents chapter of the vertical (9:16) video.
