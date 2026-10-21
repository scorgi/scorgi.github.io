import { onReady } from "../ui/page-init.mjs";
import { renderFeatureCardGrid } from "../ui/components/feature-card-grid.mjs";

const cards = [
  { icon: "bi-credit-card-fill", title: "Stripe Checkout", description: "PCI-compliant payment processing powered by Stripe. Accept credit cards, ACH transfers, and Apple Pay. Families pay online in seconds through a branded checkout page." },
  { icon: "bi-box-seam-fill", title: "Flexible Packages", description: "Create hourly rates, session bundles, monthly subscriptions, or flat-fee bootcamp packages. Mix and match pricing models for different services and student types." },
  { icon: "bi-mortarboard-fill", title: "529 Plan Support", description: "Accept 529 education savings plan payments with proper documentation and receipts. Scorgi generates the itemized statements families need for 529 reimbursement." },
  { icon: "bi-file-earmark-check-fill", title: "Digital Waivers", description: "Collect signed liability waivers, media release forms, and service agreements during enrollment. Documents are stored securely and accessible anytime from the client profile." },
  { icon: "bi-receipt-cutoff", title: "Receipts & Invoicing", description: "Automatic receipts after every payment. Generate custom invoices for corporate clients or school contracts. Export transaction history for your accountant with one click." },
  { icon: "bi-arrow-clockwise", title: "Automated Billing", description: "Set up recurring billing for ongoing students. Scorgi tracks session usage against packages, sends low-balance alerts, and auto-charges when balances run out." },
];

onReady(() => {
  renderFeatureCardGrid("feature-cards", cards);
});
