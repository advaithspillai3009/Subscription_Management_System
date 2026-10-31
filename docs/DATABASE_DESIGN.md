# DATABASE DESIGN & RELATIONAL DATA MODEL
## Brightloop – Subscription Management System

---

## 1. Database Philosophy & Storage Engine

The Brightloop database architecture is designed with three core principles:
1. **Strict Financial Precision**: All monetary values are stored with fixed decimal precision (`DECIMAL(12, 2)`) to eliminate binary floating-point rounding errors.
2. **ACID Transaction Safety & Referential Integrity**: Foreign keys enforce referential boundaries with `ON DELETE RESTRICT` on historical commercial entities.
3. **Compound B-Tree Indexing**: Specialized indexes optimize lookup latency for billing queries, customer search, and multi-tenant isolation, guaranteeing sub-2-second response times.

### Supported Database Engines
- **Development & Hackathon Default**: **SQLite 3** operating in **WAL (Write-Ahead Logging)** mode with `PRAGMA foreign_keys = ON;` and `PRAGMA synchronous = NORMAL;`. Provides sub-millisecond query execution, zero cloud dependency, and effortless reproducibility.
- **Enterprise / Production**: **PostgreSQL 15+** via the standard SQLAlchemy connection string with zero code changes.

---

## 2. Complete Schema Specifications

### 2.1 Identity & Security

#### Table: `users`
Stores system accounts for Admins, Staff, and Customer logins.
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### Table: `password_resets`
Stores secure time-bounded tokens for password recovery.
```sql
CREATE TABLE password_resets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pwd_resets_token ON password_resets(token_hash, is_used);
```

---

### 2.2 Customer Entity

#### Table: `customers`
Stores business profiles, billing addresses, and tax identifiers.
```sql
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    gstin VARCHAR(20),
    billing_street VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100) DEFAULT 'India',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_company ON customers(company_name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);
```

---

### 2.3 Product Catalog & Variants

#### Table: `products`
Stores base recurring products, services, and add-on items.
```sql
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('saas_platform', 'metered_service', 'addon_module', 'professional_service')),
    sales_price DECIMAL(12, 2) NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_active ON products(is_active);
```

#### Table: `product_variants`
Stores variant specifications with additive price offsets.
*(e.g., Selecting "Odoo Brand" variant adds ₹560 to product price)*
```sql
CREATE TABLE product_variants (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_name VARCHAR(100) NOT NULL,
    attribute_type VARCHAR(50) NOT NULL DEFAULT 'brand',
    price_offset DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product ON product_variants(product_id, is_active);
```

---

### 2.4 Plans & Billing Frequencies

#### Table: `plans`
Stores recurring subscription plan definitions and termination policies.
```sql
CREATE TABLE plans (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    plan_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    base_price DECIMAL(12, 2) NOT NULL,
    min_quantity INTEGER NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    auto_close_on_expiry BOOLEAN NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plans_frequency ON plans(frequency);
CREATE INDEX idx_plans_active ON plans(is_active);
```

---

### 2.5 Quotations & Templates

#### Table: `quotation_templates`
Reusable templates pre-populating standard plan and product lines.
```sql
CREATE TABLE quotation_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    plan_id VARCHAR(36) REFERENCES plans(id) ON DELETE RESTRICT,
    validity_days INTEGER NOT NULL DEFAULT 30,
    payment_terms VARCHAR(50) NOT NULL DEFAULT 'Net 15',
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Table: `quotations`
Commercial offers with expiration tracking and 1-click subscription conversion.
```sql
CREATE TABLE quotations (
    id VARCHAR(36) PRIMARY KEY,
    quotation_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    plan_id VARCHAR(36) NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'converted', 'expired', 'rejected')),
    validity_days INTEGER NOT NULL DEFAULT 30,
    valid_until DATE NOT NULL,
    payment_terms VARCHAR(50) NOT NULL DEFAULT 'Net 15',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    converted_subscription_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotes_customer ON quotations(customer_id);
CREATE INDEX idx_quotes_status ON quotations(status);
```

#### Table: `quotation_lines`
Individual line items on a quotation.
```sql
CREATE TABLE quotation_lines (
    id VARCHAR(36) PRIMARY KEY,
    quotation_id VARCHAR(36) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id VARCHAR(36) REFERENCES product_variants(id) ON DELETE RESTRICT,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12, 2) NOT NULL
);

CREATE INDEX idx_quote_lines_quote ON quotation_lines(quotation_id);
```

---

### 2.6 Subscriptions & Lifecycle

#### Table: `subscriptions`
The core recurring contract ledger.
```sql
CREATE TABLE subscriptions (
    id VARCHAR(36) PRIMARY KEY,
    subscription_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    plan_id VARCHAR(36) NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'quotation', 'confirmed', 'active', 'paused', 'closed')),
    billing_frequency VARCHAR(20) NOT NULL CHECK (billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    expiry_date DATE,
    next_billing_date DATE NOT NULL,
    last_billing_date DATE,
    payment_terms VARCHAR(50) NOT NULL DEFAULT 'Net 15',
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_recurring_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    auto_close_on_expiry BOOLEAN NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subs_customer ON subscriptions(customer_id);
CREATE INDEX idx_subs_status_billing ON subscriptions(status, next_billing_date);
CREATE INDEX idx_subs_number ON subscriptions(subscription_number);
```

#### Table: `subscription_lines`
Product and add-on components attached to the subscription.
```sql
CREATE TABLE subscription_lines (
    id VARCHAR(36) PRIMARY KEY,
    subscription_id VARCHAR(36) NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id VARCHAR(36) REFERENCES product_variants(id) ON DELETE RESTRICT,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12, 2) NOT NULL
);

CREATE INDEX idx_sub_lines_sub ON subscription_lines(subscription_id);
```

#### Table: `subscription_audit_logs`
Chronological audit trail of all subscription mutations.
```sql
CREATE TABLE subscription_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    subscription_id VARCHAR(36) NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    notes TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_sub ON subscription_audit_logs(subscription_id, timestamp);
```

---

### 2.7 Invoices & Billing Engine

#### Table: `invoices`
Tax invoices generated automatically by the recurring billing engine.
```sql
CREATE TABLE invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    subscription_id VARCHAR(36) NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'paid', 'partially_paid', 'overdue', 'cancelled')),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    balance DECIMAL(12, 2) NOT NULL,
    payment_terms VARCHAR(50) NOT NULL DEFAULT 'Net 15',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CRITICAL: Idempotent billing constraint preventing duplicate invoices for the same period
CREATE UNIQUE INDEX uq_invoice_sub_period ON invoices(subscription_id, billing_period_start);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status_due ON invoices(status, due_date);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
```

#### Table: `invoice_lines`
Individual line items on the invoice.
```sql
CREATE TABLE invoice_lines (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id VARCHAR(36) REFERENCES product_variants(id) ON DELETE RESTRICT,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(12, 2) NOT NULL
);

CREATE INDEX idx_invoice_lines_inv ON invoice_lines(invoice_id);
```

---

### 2.8 Taxes & Discounts

#### Table: `tax_rules`
Tax definitions managed exclusively by Admins.
```sql
CREATE TABLE tax_rules (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    rate DECIMAL(5, 2) NOT NULL,
    tax_type VARCHAR(20) NOT NULL DEFAULT 'exclusive' CHECK (tax_type IN ('inclusive', 'exclusive')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tax_rules_code ON tax_rules(code);
```

#### Table: `discount_rules`
Automated discount rules managed exclusively by Admins.
```sql
CREATE TABLE discount_rules (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(12, 2) NOT NULL,
    min_purchase_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    min_quantity INTEGER NOT NULL DEFAULT 1,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('product', 'subscription')),
    target_product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    max_usage INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discounts_code ON discount_rules(code);
CREATE INDEX idx_discounts_active_dates ON discount_rules(is_active, start_date, end_date);
```

---

### 2.9 Payments & Reconciliation

#### Table: `payments`
Recorded payments matching against invoices.
```sql
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    payment_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id VARCHAR(36) NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('upi', 'net_banking', 'card', 'bank_transfer', 'cheque', 'cash')),
    amount DECIMAL(12, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    transaction_reference VARCHAR(100),
    notes TEXT,
    recorded_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

---

## 3. Performance & Indexing Strategy

1. **Sub-2-Second Query Execution**:
   - Queries filtering by status, date, or foreign keys utilize index seek rather than full table scans.
   - Example billing scan:
     ```sql
     EXPLAIN QUERY PLAN
     SELECT * FROM subscriptions 
     WHERE status = 'active' AND next_billing_date <= '2026-11-01';
     -- Result: SEARCH subscriptions USING INDEX idx_subs_status_billing (status=? AND next_billing_date<=?)
     ```
2. **Server-Side Pagination**:
   - Tabular endpoints enforce indexed `LIMIT ? OFFSET ?` clauses with capped maximum sizes ($100$ records).
3. **Database Transactions**:
   - Multi-table writes (such as creating an invoice with line items and advancing the subscription billing date) execute inside atomic transactions to eliminate orphaned or partial records.
