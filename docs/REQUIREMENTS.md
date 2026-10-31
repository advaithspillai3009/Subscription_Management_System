# FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS
## Brightloop – Subscription Management System

This document outlines the complete specification of functional and non-functional requirements derived from the official **Odoo Subscription Management System Hackathon Problem Statement** and the **Brightloop Master Project Brief**.

---

## 1. Functional Requirements by Module

### 1.1 Authentication & Security (REQ-AUTH)
- **REQ-AUTH-01 (Registration)**: Any new business customer can register an account using a unique email address and a password.
- **REQ-AUTH-02 (Email Uniqueness)**: The system must enforce database-level email uniqueness. Duplicate registrations must be blocked with an informative error.
- **REQ-AUTH-03 (Password Policy)**: Passwords must strictly satisfy:
  - Length greater than 8 characters ($> 8$).
  - At least one uppercase English letter (`A-Z`).
  - At least one lowercase English letter (`a-z`).
  - At least one special character (`!@#$%^&*()_+-=[]{}|;:,.<>?`).
- **REQ-AUTH-04 (Password Encryption)**: Passwords must be hashed using industry-standard salted hashing algorithms (`bcrypt` with cost factor $\ge 12$). Plaintext passwords must never be stored, logged, or returned via API.
- **REQ-AUTH-05 (Authentication & Session)**: Secure authentication via HTTP-only, SameSite session cookies or signed JWT tokens containing user ID and role claims.
- **REQ-AUTH-06 (Password Reset Workflow)**: Users can request a password reset link by providing their registered email. If configured with an SMTP email provider, a cryptographically random, time-bounded token (valid for 60 minutes) is sent. The UI must explicitly indicate if an email provider is unconfigured rather than showing false delivery confirmations.
- **REQ-AUTH-07 (Role Resolution)**: Upon login, the user's role (`admin`, `staff`, or `customer`) determines the authorized workspace context and backend API access boundaries.

---

### 1.2 User Roles & Staff Management (REQ-ROLE & REQ-STAF)
- **REQ-ROLE-01 (Role Segregation)**: The system must support three distinct roles:
  - **Admin**: Full master control over system configuration, users, staff, taxes, discount rules, products, plans, and financial reports.
  - **Staff**: Operational access to customers, quotations, subscriptions, invoice confirmation, and payment logging. Cannot create discount rules, alter tax tables, or manage staff accounts.
  - **Customer**: Access restricted strictly to the Customer Self-Service Portal.
- **REQ-ROLE-02 (Backend Authorization)**: All API routes and mutations must enforce server-side role validation. Frontend link suppression is insufficient.
- **REQ-STAF-01 (Staff Provisioning)**: Only users with the `admin` role can create new staff accounts, edit staff profiles, modify roles/permissions, or deactivate staff members.
- **REQ-STAF-02 (Staff Deactivation)**: Deactivated staff accounts must have active sessions invalidated immediately and prevented from logging in.

---

### 1.3 Product Catalog & Variants (REQ-PROD)
- **REQ-PROD-01 (Product Attributes)**: Products must contain:
  - `name`: String (e.g., "Enterprise Cloud Storage", "Brightloop ERP Core").
  - `type`: Category indicator (Service, SaaS Platform, Add-on Module, Physical Asset).
  - `sales_price`: Decimal numeric representation of standard unit selling price.
  - `cost_price`: Decimal numeric representation of standard internal cost price.
  - `notes`: Rich text / string description and specifications.
  - `status`: Active or Deactivated.
- **REQ-PROD-02 (Product Lifecycle)**: Admins can create, edit, deactivate, or delete products (deletion blocked if referenced by active subscriptions or historic invoices).
- **REQ-PROD-03 (Product Variants)**: Products can support multiple variants (e.g., Brand, Cloud Region, SLA Tier).
- **REQ-PROD-04 (Variant Price Adjustments)**: Each variant can define an additive price offset. 
  - *Example from Problem Statement*: Choosing the **Odoo Brand** variant adds exactly **₹560** to the product's base price.

---

### 1.4 Plan Management (REQ-PLAN)
- **REQ-PLAN-01 (Billing Frequencies)**: Plans must support flexible recurring cadences:
  - **Daily**: Bills every 1 calendar day.
  - **Weekly**: Bills every 7 calendar days.
  - **Monthly**: Bills every calendar month (standard 30-day / date-matching cadence).
  - **Yearly**: Bills every 365 calendar days (annual settlement).
- **REQ-PLAN-02 (Plan Pricing & Economics)**: Each plan defines its recurring base price and setup fee (if any).
- **REQ-PLAN-03 (Minimum Quantity)**: Plans can specify a minimum subscription quantity threshold (e.g., minimum 5 seats).
- **REQ-PLAN-04 (Validity Dates)**: Plans can have an available start date and an optional expiry end date.
- **REQ-PLAN-05 (Plan Termination Policy)**: Configured on a plan-by-plan basis:
  - *Automatic Closure*: The subscription automatically closes when the contract end date is reached.
  - *Manual Lifecycle*: The plan permits early cancellation, manual pause/resume, or renewal extensions.

---

### 1.5 Customer Relationship Management (REQ-CUST)
- **REQ-CUST-01 (Customer Profile)**: Stores business entity details, primary contact name, email, phone number, billing address, shipping address, and GSTIN/Tax ID.
- **REQ-CUST-02 (Customer Directory & Search)**: Fast search and filtering across customer names, contact emails, company names, cities, and account statuses.
- **REQ-CUST-03 (360-Degree Customer View)**: Detailed profile view consolidating:
  - Active and past subscriptions.
  - Generated invoices and payment status.
  - Total historical revenue contributed (LTV).
  - Outstanding balances and pending settlements.

---

### 1.6 Quotations & Templates (REQ-QUOT)
- **REQ-QUOT-01 (Quotation Templates)**: Reusable quotation templates pre-configured with default plan selections, standard product lines, and predefined payment terms.
- **REQ-QUOT-02 (Quotation Creation)**: Sales reps can draft customized proposals selecting customer, template, products, variants, quantities, unit prices, and applicable taxes.
- **REQ-QUOT-03 (Validity Window)**: Quotations must enforce a validity duration (e.g., valid for 15, 30, or 60 days). Expired quotations cannot be converted without renewal.
- **REQ-QUOT-04 (Draft & Quotation States)**: Lifecycle includes `Draft` (editable work-in-progress) and `Sent/Quotation` (locked offer awaiting customer acceptance).
- **REQ-QUOT-05 (1-Click Subscription Conversion)**: Upon approval, the quotation converts automatically into a confirmed subscription, transferring all line items, tax rules, and pricing without manual re-entry.

---

### 1.7 Subscription Lifecycle Management (REQ-SUBS)
- **REQ-SUBS-01 (Unique Identifier)**: Each subscription receives a sequential, immutable reference number (e.g., `SUB-9821`).
- **REQ-SUBS-02 (Core Contract Attributes)**:
  - Associated Customer.
  - Assigned Plan and Billing Cadence.
  - Start Date and Expiry Date.
  - Payment Terms (e.g., Due Upon Receipt, Net 15, Net 30).
  - Detailed line items: Product, Variant, Quantity, Unit Price, Applied Taxes, Line Total.
  - Total Recurring Contract Value.
- **REQ-SUBS-03 (State Machine)**: Subscriptions transition through strict states:
  $$\text{Draft} \longrightarrow \text{Quotation} \longrightarrow \text{Confirmed} \longrightarrow \text{Active} \longrightarrow \text{Closed}$$
- **REQ-SUBS-04 (Lifecycle Operations)**:
  - **Pause**: Suspends billing generation until unpaused.
  - **Resume**: Re-activates a paused subscription, updating the next billing date.
  - **Renew**: Extends subscription contract end date by one or more billing cycles.
  - **Early Close**: Allows early cancellation with recorded cancellation reason.
  - **Auto-Expiry**: Automatically transitions to `Closed` on expiry date if plan dictates auto-closure.
- **REQ-SUBS-05 (History Audit Trail)**: Full log of status transitions, upgrades, pauses, and renewals with timestamps and acting user IDs.

---

### 1.8 Automated Recurring Invoices (REQ-INVC)
- **REQ-INVC-01 (Automated Generation)**: Subscriptions due for billing automatically generate recurring invoices on the billing date.
- **REQ-INVC-02 (Invoice Lifecycle)**: Invoices transition through states:
  $$\text{Draft} \longrightarrow \text{Confirmed} \longrightarrow \text{Paid}$$
  *(With auxiliary states: `Cancelled`, `Overdue`)*
- **REQ-INVC-03 (Line Item Prefilling)**: Invoices automatically inherit customer details, billing address, line items, variant adjustments, applied taxes, and eligible discounts from the active subscription contract.
- **REQ-INVC-04 (Zero Duplicate Billing Guarantee)**: The system must enforce that a subscription cannot generate more than one invoice for any given billing cycle interval. Compound database constraints (`subscription_id`, `billing_period_start`) prevent duplicate entries.
- **REQ-INVC-05 (Invoice Actions)**:
  - **Confirm**: Locks a draft invoice, assigning an official tax invoice sequence number (e.g., `INV-2026-0042`).
  - **Cancel**: Voids an unpaid invoice with recorded reason.
  - **Send**: Marks invoice as transmitted to customer email.
  - **Print / PDF**: Generates a standardized, GST-compliant printable PDF invoice.
- **REQ-INVC-06 (Automated Scheduler)**: Backend background worker executes billing runs independently of browser sessions.

---

### 1.9 Tax Management (REQ-TAXS)
- **REQ-TAXS-01 (Tax Rule Governance)**: Only admins can create, update, or deactivate tax rules.
- **REQ-TAXS-02 (Tax Attributes)**:
  - Tax Name (e.g., "GST 18%", "CGST 9% + SGST 9%", "IGST 18%", "Exempt 0%").
  - Tax Rate Percentage (e.g., 18.00%).
  - Tax Type (Inclusive vs. Exclusive).
  - Scope / Region.
- **REQ-TAXS-03 (Consistent Calculation Engine)**: The identical tax calculation logic must be applied deterministically across Quotations, Subscriptions, and Invoices.
  $$\text{Tax Amount} = \text{Taxable Subtotal} \times \left(\frac{\text{Rate}}{100}\right)$$

---

### 1.10 Discount & Coupon Engine (REQ-DISC)
- **REQ-DISC-01 (Admin Control)**: Only admins have permission to define and modify discount rules.
- **REQ-DISC-02 (Discount Types)**:
  - **Percentage Discount**: Reduces eligible subtotal by a percentage (e.g., 15% off).
  - **Fixed Amount Discount**: Deducts a flat currency sum (e.g., ₹2,500 off).
- **REQ-DISC-03 (Eligibility Thresholds)**:
  - Minimum purchase amount threshold (e.g., orders $> ₹10,000$).
  - Minimum purchase quantity threshold (e.g., $\ge 10$ seats).
- **REQ-DISC-04 (Scope Rules)**:
  - *Product-Specific*: Applies only to designated product lines.
  - *Subscription-Wide*: Applies to the aggregate subscription contract total.
- **REQ-DISC-05 (Time & Usage Limits)**:
  - Validity date range: `start_date` and `end_date`.
  - Max lifetime redemptions limit (e.g., first 50 customers).
  - Active redemption counter tracking.
- **REQ-DISC-06 (Autonomous Application)**: Once applied, discounts must automatically reflect on recurring invoices for the duration of eligibility and automatically stop when limits or expiration dates are reached.

---

### 1.11 Payment Reconciliation (REQ-PAYM)
- **REQ-PAYM-01 (Payment Recording)**: Staff/Admin can record incoming payments against confirmed invoices.
- **REQ-PAYM-02 (Payment Record Schema)**:
  - Unique Payment ID.
  - Associated Invoice ID.
  - Associated Customer ID.
  - Payment Method: UPI, Net Banking, Credit/Debit Card, Bank Transfer (NEFT/RTGS), Cheque, Cash.
  - Amount Paid.
  - Payment Timestamp.
  - Transaction Reference / Notes.
- **REQ-PAYM-03 (Partial & Full Payment Tracking)**:
  - If `amount_paid` $\ge$ `invoice_balance`, invoice status transitions to `Paid`.
  - If `amount_paid` $<$ `invoice_balance`, invoice status updates to `Partially Paid` with remaining balance tracked.
- **REQ-PAYM-04 (Overdue Flagging & Dunning)**: Unpaid invoices past their payment terms date are flagged as `Overdue` and highlighted for dunning escalation.

---

### 1.12 Reports, Telemetry & Analytics (REQ-REPT)
- **REQ-REPT-01 (Core Financial KPIs)**:
  - **Monthly Recurring Revenue (MRR)**: Normalised monthly value of all active recurring contracts.
  - **Annual Run-Rate (ARR)**: $\text{MRR} \times 12$.
  - **Total Collected Cash**: Actual reconciled payments deposited within selected fiscal timeframe.
  - **Total Outstanding Pipeline**: Unpaid confirmed invoices within due terms.
  - **Overdue Exposure**: Unpaid invoices past payment terms at immediate risk of churn.
- **REQ-REPT-02 (Separation of Financial Realities)**: Visual and tabular reporting must strictly distinguish **Actual Collected Cash** from **Projected / Contracted Revenue** and **Overdue Balances**.
- **REQ-REPT-03 (Trend Analytics)**: Historical charts tracking 12-month MRR growth, subscriber count evolution, cohort churn, and plan tier distribution.
- **REQ-REPT-04 (Filtering & Drill-down)**: Filter reports by date ranges, plan tiers, and customer segments.

---

### 1.13 Customer Self-Service Portal (REQ-PORT)
- **REQ-PORT-01 (Strict Isolation)**: Customers authenticated to the portal can view only their own company's data. Zero visibility into other tenants.
- **REQ-PORT-02 (Portal Dashboard)**: Displays overview of current active subscriptions, contracted plans, renewal dates, and outstanding invoice balances.
- **REQ-PORT-03 (Invoice Vault)**: Complete chronological history of invoices with live payment status (`Paid`, `Pending`, `Overdue`).
- **REQ-PORT-04 (Invoice PDF Download)**: 1-click download of printable, official tax invoices.
- **REQ-PORT-05 (Profile & Billing Details)**: Manage billing addresses, GSTIN numbers, and primary contact details.

---

## 2. Non-Functional Requirements (NFR)

### 2.1 Performance & Latency (NFR-PERF)
- **NFR-PERF-01 (Sub-2-Second Response Target)**: **Every single page and API endpoint must respond in under 2.0 seconds**, even with thousands of active subscriptions and historical invoice ledgers.
- **NFR-PERF-02 (Compound Indexing)**: Database foreign keys, search fields, status flags, and date-range queries must have compound B-tree indexes.
- **NFR-PERF-03 (Server-Side Pagination)**: All tabular views (subscriptions, invoices, customers, audit logs) must implement server-side pagination with default page sizes of 15, 25, or 50 records. Unbounded queries (`SELECT *`) are forbidden.
- **NFR-PERF-04 (Optimized Aggregations)**: Dashboard metric cards must compute analytics using indexed SQL aggregate queries (`SUM`, `COUNT`, `GROUP BY`) rather than transferring entire table records to memory.

---

### 2.2 Security & Data Protection (NFR-SEC)
- **NFR-SEC-01 (SQL Injection Prevention)**: All database queries must use parameterized prepared statements or an ORM with built-in parameterization. No raw string interpolation in queries.
- **NFR-SEC-02 (Cross-Site Scripting [XSS] Prevention)**: All dynamic UI content must be sanitized and rendered with automatic HTML escaping.
- **NFR-SEC-03 (Cross-Site Request Forgery [CSRF])**: State-changing requests must be protected via CSRF tokens or SameSite cookie policies.
- **NFR-SEC-04 (Authorization Boundary Enforcement)**: Strict server-side verification that `customer` role requests access only records where `customer_id == session.user.customer_id`.
- **NFR-SEC-05 (Credential Protection)**: No secrets, private API keys, or database credentials committed to version control. Configuration managed strictly via environment variables.

---

### 2.3 Reliability & Financial Data Integrity (NFR-REL)
- **NFR-REL-01 (ACID Financial Transactions)**: Operations that mutate financial state (such as converting a quotation to a subscription, running a billing cycle, or recording a payment) must execute inside database transactions (`BEGIN ... COMMIT / ROLLBACK`).
- **NFR-REL-02 (Idempotent Billing Runs)**: Billing scheduler jobs must be completely idempotent. Re-running the billing worker multiple times on the same day must not create duplicate invoices.
- **NFR-REL-03 (Decimal Precision)**: All currency calculations must use exact fixed-point decimal arithmetic (e.g., `DECIMAL(12, 2)` or integer cents/paise) to prevent floating-point rounding errors.
- **NFR-REL-04 (Immutable Audit Trail)**: Status changes on subscriptions and invoices must generate append-only audit entries.

---

### 2.4 Usability & UI/UX Fidelity (NFR-UX)
- **NFR-UX-01 (Design System Fidelity)**: The application must strictly honor the **Google Stitch Studio Minimalist System** tokens (Tokyo Studio aesthetic, Space Grotesk typography, `#F8FAF9` canvas, `#2F7D72` sage teal accents).
- **NFR-UX-02 (Responsive Adaptability)**: Fully responsive across Desktop ($\ge 1200\text{px}$), Tablet ($768\text{px} - 1199\text{px}$), and Mobile ($< 768\text{px}$).
- **NFR-UX-03 (Zero Non-Functional Elements)**: Every button, toggle, and link in the interface must be backed by genuine application functionality. No non-functional decorative buttons.
- **NFR-UX-04 (Zero Fake Telemetry)**: All dashboard charts, metric counters, and health indicators must reflect real database calculations.

