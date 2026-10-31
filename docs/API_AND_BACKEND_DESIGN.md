# API & BACKEND DESIGN SPECIFICATIONS
## Brightloop – Subscription Management System

---

## 1. RESTful Standards & Architectural Conventions

All Brightloop API endpoints follow strict REST conventions:
- **Base URL**: `/api/v1` (with `/api` fallback aliases).
- **Format**: All request bodies and JSON responses use `application/json; charset=utf-8`.
- **Date Format**: Standard ISO 8601 (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`).
- **Monetary Quantities**: Represented as numeric fixed-decimal strings or float values with two decimal places (e.g., `2400.00`).
- **HTTP Status Codes**:
  - `200 OK`: Successful read or synchronous update.
  - `201 Created`: Successful entity creation.
  - `400 Bad Request`: Payload validation error or invalid business transition.
  - `401 Unauthorized`: Missing or invalid session token.
  - `403 Forbidden`: Authenticated user lacks required role permissions.
  - `404 Not Found`: Resource does not exist.
  - `409 Conflict`: Unique constraint violation (e.g. duplicate billing period or duplicate email).
  - `500 Internal Server Error`: Unhandled application exception.

---

## 2. API Endpoint Catalog

### 2.1 Authentication & Profile (`/api/auth`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Customer account registration with password policy check |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, issues session cookie / JWT |
| `POST` | `/api/auth/logout` | Authenticated | Invalidates active session / clears auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Returns current authenticated user and role profile |
| `POST` | `/api/auth/forgot-password` | Public | Initiates password reset token generation |
| `POST` | `/api/auth/reset-password` | Public | Resets password using valid unexpired token |

#### Example Payload: `POST /api/auth/register`
```json
{
  "email": "finance@razorpay-integration.com",
  "password": "Password@2026!",
  "full_name": "Arjun Nair",
  "company_name": "Razorpay Integration Ltd",
  "phone": "+91 98450 12345",
  "gstin": "29AABCR1234F1Z5"
}
```

---

### 2.2 Customer Management (`/api/customers`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | Admin, Staff | Lists customers with search query, status filters, and pagination |
| `POST` | `/api/customers` | Admin, Staff | Creates a new enterprise customer profile |
| `GET` | `/api/customers/{id}` | Admin, Staff | Retrieves customer details, addresses, and tax identifiers |
| `PUT` | `/api/customers/{id}` | Admin, Staff | Updates customer profile fields |
| `GET` | `/api/customers/{id}/overview` | Admin, Staff | Consolidated 360-degree customer view (subs, invoices, revenue) |

---

### 2.3 Product Catalog & Variants (`/api/products`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | All Roles | Lists products and their active variants |
| `POST` | `/api/products` | Admin | Creates a base product definition |
| `GET` | `/api/products/{id}` | All Roles | Retrieves product details and associated variants |
| `PUT` | `/api/products/{id}` | Admin | Modifies product details, prices, or notes |
| `DELETE` | `/api/products/{id}` | Admin | Soft-deactivates product (restricted if bound to active contracts) |
| `POST` | `/api/products/{id}/variants` | Admin | Attaches a new variant with additive price offset |
| `PUT` | `/api/variants/{id}` | Admin | Modifies variant price offset or active status |

#### Example: Product Variant Creation with Additive Pricing
```json
{
  "variant_name": "Odoo Brand Edition",
  "attribute_type": "brand",
  "price_offset": 560.00,
  "is_active": true
}
```

---

### 2.4 Plan Management (`/api/plans`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/plans` | All Roles | Lists available recurring plans and pricing models |
| `POST` | `/api/plans` | Admin | Creates a new plan (cadence: daily, weekly, monthly, yearly) |
| `GET` | `/api/plans/{id}` | All Roles | Returns plan terms, auto-closure rules, and minimum seat counts |
| `PUT` | `/api/plans/{id}` | Admin | Updates plan parameters |
| `DELETE` | `/api/plans/{id}` | Admin | Deactivates plan from active catalog |

---

### 2.5 Quotations & Templates (`/api/quotations`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/quotation-templates` | Admin, Staff | Lists reusable quotation templates |
| `POST` | `/api/quotation-templates` | Admin | Creates a new quotation template |
| `GET` | `/api/quotations` | Admin, Staff | Lists quotations with status filters (`draft`, `sent`, `converted`) |
| `POST` | `/api/quotations` | Admin, Staff | Creates a quotation proposal for a customer |
| `GET` | `/api/quotations/{id}` | Admin, Staff | Retrieves full quotation details and line items |
| `PUT` | `/api/quotations/{id}` | Admin, Staff | Updates quotation draft lines and terms |
| `POST` | `/api/quotations/{id}/send` | Admin, Staff | Marks quotation as sent, starting the validity countdown |
| `POST` | `/api/quotations/{id}/convert`| Admin, Staff | 1-Click converts quotation into a confirmed subscription |

---

### 2.6 Subscription Management (`/api/subscriptions`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subscriptions` | Admin, Staff | Lists subscriptions with pagination, plan filters, and health indices |
| `POST` | `/api/subscriptions` | Admin, Staff | Directly deploys a new subscription contract |
| `GET` | `/api/subscriptions/{id}` | Admin, Staff, Customer (Self) | Retrieves subscription contract and line items |
| `POST` | `/api/subscriptions/{id}/pause` | Admin, Staff | Pauses active subscription, halting automated invoice generation |
| `POST` | `/api/subscriptions/{id}/resume` | Admin, Staff | Resumes a paused subscription, setting next billing date |
| `POST` | `/api/subscriptions/{id}/renew` | Admin, Staff | Renews subscription contract for $N$ periods |
| `POST` | `/api/subscriptions/{id}/close` | Admin, Staff | Early-closes subscription with recorded reason |
| `GET` | `/api/subscriptions/{id}/audit` | Admin, Staff | Retrieves chronological audit trail for the contract |

---

### 2.7 Invoices & Billing Engine (`/api/invoices` & `/api/billing`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/invoices` | Admin, Staff | Lists invoices with status filters (`draft`, `confirmed`, `paid`, `overdue`) |
| `GET` | `/api/invoices/{id}` | Admin, Staff, Customer (Self) | Retrieves full invoice details and line breakdowns |
| `POST` | `/api/billing/run-scheduled` | Admin, Staff | Executes batch billing run for all subscriptions due today |
| `POST` | `/api/invoices/{id}/confirm` | Admin, Staff | Confirms a draft invoice, assigning official tax number |
| `POST` | `/api/invoices/{id}/cancel` | Admin | Voids an unpaid invoice with cancellation notes |
| `POST` | `/api/invoices/{id}/send` | Admin, Staff | Transmits invoice to customer email |
| `GET` | `/api/invoices/{id}/pdf` | Admin, Staff, Customer (Self) | Generates and streams official GST-compliant PDF invoice |

---

### 2.8 Tax & Discount Management (`/api/taxes` & `/api/discounts`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/taxes` | All Roles | Lists active tax rules |
| `POST` | `/api/taxes` | Admin Only | Configures new tax rule (e.g. GST 18%) |
| `PUT` | `/api/taxes/{id}` | Admin Only | Updates tax rate or active state |
| `GET` | `/api/discounts` | Admin, Staff | Lists active promotional and discount rules |
| `POST` | `/api/discounts` | Admin Only | Creates a discount rule (fixed or %, min purchase, limits) |
| `PUT` | `/api/discounts/{id}` | Admin Only | Modifies discount rule parameters |
| `POST` | `/api/discounts/evaluate`| Admin, Staff | Tests eligibility of a discount code against given cart lines |

---

### 2.9 Payments & Reconciliation (`/api/payments`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments` | Admin, Staff | Lists historical payments ledger |
| `POST` | `/api/payments` | Admin, Staff | Records payment against invoice (reconciles balance) |
| `GET` | `/api/payments/{id}` | Admin, Staff | Retrieves payment receipt details |

---

### 2.10 Executive Telemetry & Financial Intelligence (`/api/reports` & `/api/intelligence`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/telemetry` | Admin, Staff | Returns real-time KPI metrics (MRR, ARR, Cash, Overdue, Active Subs) |
| `GET` | `/api/reports/revenue-breakdown` | Admin | Distinguishes Cash Collected vs. Contracted ARR vs. Overdue Exposure |
| `GET` | `/api/reports/mrr-trajectory` | Admin, Staff | 12-month historical and forecasted MRR dataset |
| `GET` | `/api/intelligence/pipeline` | Admin, Staff | Kanban billing pipeline stages (Due $\rightarrow$ Generated $\rightarrow$ Paid $\rightarrow$ Overdue) |
| `GET` | `/api/penny/context` | All Roles | Contextual assistance data tailored to active page and role |

---

## 3. Error Handling Schema

All non-2xx responses return a standardized RFC 7807 compliant error payload:
```json
{
  "error": {
    "code": "DUPLICATE_BILLING_PREVENTED",
    "message": "Subscription SUB-9821 has already been billed for the period starting 2026-11-01.",
    "details": {
      "subscription_id": "sub_01H...",
      "existing_invoice_number": "INV-2026-0042",
      "billing_period_start": "2026-11-01"
    },
    "timestamp": "2026-10-31T12:00:00Z"
  }
}
```
