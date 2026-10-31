# CHANGELOG — BRIGHTLOOP SUBSCRIPTION MANAGEMENT SYSTEM

All notable changes, architectural milestones, and delivery checkpoints will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), adhering to Semantic Versioning.

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
  - `/api/portal`: Multi-tenant scoped customer self-service data endpoint.
- **Frontend Presentation Layer (Tokyo Studio Minimalist Aesthetic)**:
  - Exact fidelity to Google Stitch design tokens: `#F8FAF9` canvas, `#FFFFFF` cards, `#12191A` primary text, `#2F7D72` sage teal accent, Space Grotesk fonts, concentric circles, and audio cassette visualizers.
  - `Overview Dashboard` (`/`): 6 KPI telemetry cards, 12-month MRR SVG chart, plan distribution, cassette visualizer, and recurring ledger.
  - `Subscriptions Console` (`/subscriptions`): Filter rail, live lifecycle state transitions, deployment modal.
  - `Products & Variants` (`/products`): Tiered catalog, Odoo Brand variant (+₹560), real-time pricing simulator slider.
  - `Invoices & Settlements` (`/invoices`): Status badges, dunning protocol banner, printable GST tax invoice modal, 1-click settlement recording.
  - `Enterprise Customers` (`/customers`): Account directory, at-risk filters, customer 360° dossier drawer, and new customer registration.
  - `Commercial Quotations` (`/quotations`): Proposal builder, template quick-apply, validity countdown, and 1-click conversion to active subscription.
  - `Payments Ledger` (`/payments`): Transaction history, payment method filtering, UTR reference logging, settlement reconciliation modal.
  - `Promotional Discounts` (`/discounts`): Active promo cards, validity dates, max cap limits, rule creation modal.
  - `Customer Self-Service Portal` (`/portal`): Tenant-scoped view of active subscriptions, downloadable invoice statements, and payment receipts.
  - `Staff Governance` (`/staff`): Admin-only team member provisioning and role assignment.
  - `Authentication Suite` (`/auth/login`, `/register`, `/forgot-password`, `/reset-password`): Quick-fill evaluator buttons for Admin/Staff/Customer, live security policy checklist, dev token inspector.
- **Automated Verification & Latency Benchmarks**:
  - `scripts/test-billing-engine.ts`: Automated test suite verifying:
    - **Zero Duplicate Invoicing**: First run generates due invoices; immediate re-trigger produces exactly 0 duplicate invoices.
    - **Telemetry Latency**: Live month-end metrics query executes in **30ms** (far exceeding the $< 2.0\text{s}$ hackathon requirement).
    - **Password Security Policy**: 100% pass rate across 4 boundary conditions.
  - Verified clean Next.js production build (`npm run build`) with 31/31 static and dynamic routes compiled without errors.

---

## [0.2.0] — 2026-10-31

### Phase 1: Architecture Alignment & Team Collaboration Setup

#### Changed
- **Technology Stack Finalization**:
  - Adopted **Next.js 14 (App Router) + React 18 + TypeScript + Prisma ORM + Tailwind CSS** as the official application technology stack per user decision on Question 1.
  - Configured full-stack architecture with React Server Components, Route Handlers, and Prisma database transactions.
  - Verified local Node.js v26.13.0 and npm 11.20.0 availability.
- **Team Roster & Multi-Contributor Git Workflow**:
  - Registered core engineering team:
    - Lead: `advaithspillai3009` (`advaith.ec2529@saintgits.org`)
    - Teammates: `ashwingirish2007` (`ashwingirish2007@gmail.com`), `Nikhil-c-bit` (`nikhils.rbb2529@saintgits.org`), `adharshdnair068-bot` (`adharshdnair068@gmail.com`).
  - Established hourly Git synchronization guidelines, rebase-before-push protocol, and co-author commit standards to prevent merge conflicts.
- **Scope Consolidations**:
  - Confirmed **Internal Financial Reconciliation Ledger** with full/partial payments, official receipts, and dunning triggers.
  - Confirmed **Dual-Mode Dispatcher** for password reset links (fallback testing token inspector when SMTP unconfigured).
  - Confirmed **Hackathon Differentiator Triad** (Automated Billing Control Center, Revenue Forecasting, Penny Contextual Mascot).
  - Confirmed **Preloaded Indian B2B Enterprise Dataset** (INR ₹, GST 18%, Odoo Brand variant +₹560).

---

## [0.1.0] — 2026-10-31

### Phase 1: Inspection & Comprehensive Architecture Planning

#### Added
- **Project Master Documentation Suite**:
  - `docs/PROJECT_OVERVIEW.md`: Product vision, target personas, problem statement breakdown, and technical scope.
  - `docs/REQUIREMENTS.md`: Full catalog of functional, business, and non-functional requirements extracted from the Odoo Hackathon PDF.
  - `docs/REQUIREMENTS_TRACEABILITY.md`: Traceability matrix cross-referencing all requirements with database models, API routes, views, and test cases.
  - `docs/SYSTEM_ARCHITECTURE.md`: High-level multi-tier architecture, background job processing model, and financial transaction safeguards.
  - `docs/DATABASE_DESIGN.md`: Complete relational schema specifications, data types, compound indexes, and financial audit constraints.
  - `docs/ER_DIAGRAM.md`: Detailed Mermaid ER diagram covering all 15 core entities and relationships.
  - `docs/API_AND_BACKEND_DESIGN.md`: REST API specifications, endpoint contracts, status codes, and billing workflows.
  - `docs/UI_UX_IMPLEMENTATION.md`: UI/UX implementation guide incorporating Google Stitch design tokens, Tokyo Studio aesthetic, and responsive behaviors.
  - `docs/USER_ROLES_AND_PERMISSIONS.md`: Role-Based Access Control (RBAC) matrix defining privileges for Admin, Staff, and Customer roles.
  - `docs/UNIQUE_SOLUTION.md`: Specification for the three hackathon differentiators (Intelligence Center, Revenue Forecaster, Automated Billing Pipeline).
  - `docs/PENNY_MASCOT.md`: Visual identity, state machine, and contextual assistance logic for the Penny mascot.
  - `docs/DEVELOPMENT_ROADMAP.md`: Phased implementation timeline, hourly Git commit milestones, and verification gates.
  - `docs/TESTING_STRATEGY.md`: Test suite architecture spanning unit tests, integration workflows, idempotent billing verification, and sub-2s latency benchmarks.
  - `docs/SETUP_AND_INSTALLATION.md`: Environment setup instructions, dependencies, database initialization, and test seed execution.
  - `docs/HACKATHON_DEMO_PLAN.md`: Structured 5-minute hackathon judge walkthrough, preloaded scenario narratives, and demo data profiles.
- **Repository Initialization**:
  - Connected local workspace to central GitHub repository: `advaithspillai3009/Subscription_Management_System`.
  - Staged and verified initial documentation commit on `main`.
