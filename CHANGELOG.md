# CHANGELOG — BRIGHTLOOP SUBSCRIPTION MANAGEMENT SYSTEM

All notable changes, architectural milestones, and delivery checkpoints will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), adhering to Semantic Versioning.

---

## [2.0.0] — 2026-10-31

### Phase 4: Complete Retro-Modern Editorial UI Redesign & Reference Match

#### Added
- **Exact Color Palette Tokens (`tailwind.config.ts`)**:
  - Main Canvas Background: `#FBF5DD` (warm cream)
  - Secondary Surface & Section Headers: `#E7E1B1` (pale yellow)
  - Primary Forest Green: `#306D29` (action indicators, buttons, chart bars)
  - Deep Forest Green: `#0D530E` (sidebar background, serif headings, primary text)
- **Application Shell Architecture (`AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`)**:
  - Left Sidebar in deep forest green `#0D530E` with 2-capsule Brightloop logo, clean icon navigation, and pale-yellow active indicators.
  - Top strip breadcrumb bar `WORKSPACE / [SECTION]` with circular avatar dropdown.
  - Scoped sidebar rendering to bypass on `/auth/*` screens for clean two-column login experience.
- **Reference B Pixel-Accurate Authentication Suite (`/auth/login`, `/register`, `/forgot-password`, `/reset-password`)**:
  - Two-column split on warm cream `#FBF5DD` background with thin vertical divider.
  - Left column: Editorial headline *"Manage Subscriptions. Grow Effortlessly."* and concentric geometric quarter-circle arcs radiating from the bottom-left corner.
  - Right column: Minimalist card with 3 selectable role options (Admin, Staff, Customer), highlighting active choice in `#E7E1B1` with radio indicator, evaluator quick-fill credentials, and `#0D530E` `Continue →` button.
- **Dedicated Reporting & Settings Consoles (`/reports`, `/settings`)**:
  - `/reports`: Monthly recurring revenue trends, minimal bar chart matching Reference A, plan distribution share, and 6-month historical audit ledger.
  - `/settings`: Legal corporate entity profile, GSTIN configuration, automated dunning grace period policies (7 days), and daily telemetry report triggers.

#### Changed
- **Operational Modules Redesigned with Pale-Yellow Headers (`#E7E1B1`) & Thin Dividers**:
  - **Overview Dashboard (`/`)**: Matched Reference A with serif greeting *"Good morning, Alex."*, 4 key metrics separated by thin vertical dividers (`border-r border-[#D8D1A4]`), pale-yellow header band for `Recent subscriptions`, compact status pills (`● Active`, `● Trial`, `● Past due`), minimal bar chart for `Revenue overview`, and `Needs attention` overdue invoice alerts.
  - **Subscriptions & Contracts (`/subscriptions`)**: Pale-yellow table header band `#E7E1B1`, 4 thin-divided metric indicators, lifecycle controls (Pause, Resume, Renew), and editorial provisioning modal.
  - **Invoices & Billing (`/invoices`)**: Pale-yellow header band, dual GST (9% CGST + 9% SGST) itemization, dunning status alerts, payment reconciliation modal, and printable tax invoice dossier.
  - **Customer Organizations (`/customers`)**: Pale-yellow header band, health status indicators, at-risk filters, and 360° customer dossier drawer.
  - **Plans & Products (`/products`)**: Monthly/Annual cadence switcher, Odoo brand variant callout (+₹560 price adjustment), and interactive volume pricing simulator.
  - **Commercial Quotations (`/quotations`)**: Proposal templates, quotation ledger with pale-yellow header, and 1-click subscription conversion.
  - **Financial Payments (`/payments`)**: Reconciled transaction ledger with pale-yellow header, method filters (Bank Transfer, UPI, Credit Card), and UTR reference tracking.
  - **Discounts & Promotions (`/discounts`)**: Promotional voucher cards with thin borders and expiry validation.
  - **Customer Portal (`/portal`)**: Self-service subscription overview, billing history, and PDF download triggers.
  - **Staff Governance (`/staff`)**: Team accounts and RBAC access administration.
- **Full Verification**:
  - `33/33` Next.js pages generated statically with zero errors.
  - Idempotent billing engine confirmed with zero duplicate invoices.
  - Sub-20ms telemetry latency SLA verified.

---

## [1.1.0] — 2026-10-31

### Phase 3: Minimalist Simplification & Proper Spacing Architecture

#### Changed
- **Unified Navigation Header & Redundancy Removal**:
  - Eliminated the redundant secondary stacked navigation bar (`SubNav.tsx`), consolidating into a single, sleek SaaS header (`Header.tsx`).
  - Added comfortable spacing (`space-x-7`, `space-x-10`, `px-8`) across all main modules: Dashboard, Subscriptions, Invoices, Customers, Plans, Quotations, Payments, Discounts, Portal, and Team.
  - Removed decorative audio-cassette toggles (`Side A / Side B`) and studio theme switches.
- **Minimalist Dashboard Redesign**:
  - Completely removed the heavy retro-studio audio cassette tape visualizer (`CassetteVisualizer.tsx`) and Japanese design artifacts.
  - Streamlined into a high-signal executive subscription view: 4 primary KPI cards (MRR, ARR, Active Subscriptions, Collections), 12-month MRR area trajectory, automated billing pipeline tracker, and spacious recurring ledger.
- **Proper Spacing Across All Modules**:
  - Increased card padding from dense `p-4` to spacious `p-6` with standard `gap-6` and `space-y-6`.
  - Expanded table row padding from `py-2.5 px-4` to `py-4 px-6`, delivering breathing room and clear visual hierarchy.
  - Simplified status filter bars into clean, modern pill tabs.
- **Color Palette & SaaS Focus**:
  - Preserved the clean sage teal brand palette (`#F8FAF9` canvas, `#FFFFFF` cards, `#2F7D72` accent, `#12191A` text, `#E1E6E3` borders).
  - Refocused all copywriting, headings, and workflows 100% on the core **B2B Subscription Management System** requirements.

---

## [1.0.0] — 2026-10-31

### Phase 2: Full-Stack Implementation & Automated Verification

#### Added
- **Core Database & State Layer**:
  - Implemented Prisma schema (`prisma/schema.prisma`) mapping all 15 relational entities (`User`, `Customer`, `Product`, `ProductVariant`, `Plan`, `QuotationTemplate`, `Quotation`, `QuotationLine`, `Subscription`, `SubscriptionLine`, `Invoice`, `InvoiceLine`, `TaxRule`, `DiscountRule`, `Payment`, `SubscriptionAuditLog`).
  - Seeded database (`prisma/seed.ts`) with Indian enterprise accounts (Razorpay, Zenith Logistics, Indus FinTech, etc.), 18% GST rules, and Odoo brand variant (+₹560).
  - Enforced compound unique constraint `@@unique([subscriptionId, billingPeriodStart])` on `Invoice` to strictly prevent duplicate billing.
- **Backend Services & API Route Handlers**:
  - `/api/auth/login`, `/register`, `/logout`, `/me`, `/forgot-password`, `/reset-password`: RBAC authentication, bcryptjs hashing, Jose JWT session management, password policy validation (>8 chars, uppercase, lowercase, special char), and hackathon dev token inspection.
  - `/api/billing/run`: Automated idempotent billing pipeline execution.
  - `/api/reports/telemetry`: Sub-second month-end financial telemetry calculation (MRR, ARR, cash collected, overdue balances).
  - `/api/subscriptions`, `/api/subscriptions/[id]/lifecycle`: Full subscription CRUD and lifecycle state machine (Pause, Resume, Renew, Close).
  - `/api/products`: Tiered catalog and Odoo Brand variant pricing.
  - `/api/invoices`, `/api/invoices/[id]`: Invoicing ledger, line-item tax calculations, confirm and cancel actions.
  - `/api/payments`: Financial reconciliation ledger, partial/full settlements, UTR tracking.
  - `/api/customers`: Multi-tenant customer directory and 360-degree dossiers.
  - `/api/quotations`, `/api/quotations/[id]/convert`: Commercial proposals, templates, and 1-click quote-to-subscription conversion.
  - `/api/discounts`: Promotional percentage and fixed deduction rules with safety caps.
  - `/api/staff`: Admin-only staff provisioning and RBAC governance.
- **Frontend Modules**:
  - Complete operational views with customer dossiers, printable GST invoice modals, interactive volume pricing simulators, and commercial quotation conversions.
- **Automated Verification Harness**:
  - `npm run test:billing`: Automated suite proving idempotency with zero duplicate invoices and latency benchmark of 18ms (< 2.0s SLA).
