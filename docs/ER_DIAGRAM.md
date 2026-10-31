# ENTITY RELATIONSHIP (ER) DIAGRAM
## Brightloop – Subscription Management System

---

## 1. High-Level Entity Relationship Topology

The diagram below maps all core relational entities within Brightloop, including foreign keys, cardinalities, and field types.

```mermaid
erDiagram
    USERS ||--o| CUSTOMERS : "authenticates as"
    USERS ||--o{ PASSWORD_RESETS : "requests"
    USERS ||--o{ SUBSCRIPTION_AUDIT_LOGS : "acts in"
    USERS ||--o{ QUOTATIONS : "creates"
    USERS ||--o{ PAYMENTS : "records"

    CUSTOMERS ||--o{ QUOTATIONS : "receives"
    CUSTOMERS ||--o{ SUBSCRIPTIONS : "contracts"
    CUSTOMERS ||--o{ INVOICES : "billed by"
    CUSTOMERS ||--o{ PAYMENTS : "remits"

    PRODUCTS ||--o{ PRODUCT_VARIANTS : "defines variants for"
    PRODUCTS ||--o{ QUOTATION_LINES : "quoted in"
    PRODUCTS ||--o{ SUBSCRIPTION_LINES : "subscribed in"
    PRODUCTS ||--o{ INVOICE_LINES : "billed in"
    PRODUCTS ||--o{ DISCOUNT_RULES : "targeted by"

    PRODUCT_VARIANTS ||--o{ QUOTATION_LINES : "applied to"
    PRODUCT_VARIANTS ||--o{ SUBSCRIPTION_LINES : "applied to"
    PRODUCT_VARIANTS ||--o{ INVOICE_LINES : "applied to"

    PLANS ||--o{ QUOTATION_TEMPLATES : "pre-populates"
    PLANS ||--o{ QUOTATIONS : "offered in"
    PLANS ||--o{ SUBSCRIPTIONS : "governs billing of"

    QUOTATION_TEMPLATES ||--o{ QUOTATION_TEMPLATE_LINES : "contains"
    QUOTATION_TEMPLATES ||--o{ QUOTATIONS : "initializes"

    QUOTATIONS ||--o{ QUOTATION_LINES : "comprises"
    QUOTATIONS ||--o| SUBSCRIPTIONS : "converts into"

    SUBSCRIPTIONS ||--o{ SUBSCRIPTION_LINES : "comprises"
    SUBSCRIPTIONS ||--o{ INVOICES : "generates recurring"
    SUBSCRIPTIONS ||--o{ SUBSCRIPTION_AUDIT_LOGS : "logged in"

    INVOICES ||--o{ INVOICE_LINES : "comprises"
    INVOICES ||--o{ PAYMENTS : "reconciled by"

    TAX_RULES ||..o{ QUOTATION_LINES : "applies rate to"
    TAX_RULES ||..o{ SUBSCRIPTION_LINES : "applies rate to"
    TAX_RULES ||..o{ INVOICE_LINES : "applies rate to"

    DISCOUNT_RULES ||..o{ QUOTATIONS : "reduces subtotal of"
    DISCOUNT_RULES ||..o{ SUBSCRIPTIONS : "reduces contract of"
    DISCOUNT_RULES ||..o{ INVOICES : "deducted on"

    USERS {
        string id PK
        string email UK
        string password_hash
        string full_name
        string role
        boolean is_active
        timestamp created_at
    }

    CUSTOMERS {
        string id PK
        string user_id FK
        string company_name
        string contact_name
        string email
        string phone
        string gstin
        string billing_city
        string status
    }

    PRODUCTS {
        string id PK
        string name
        string product_code UK
        string type
        decimal sales_price
        decimal cost_price
        boolean is_active
    }

    PRODUCT_VARIANTS {
        string id PK
        string product_id FK
        string variant_name
        string attribute_type
        decimal price_offset
        boolean is_active
    }

    PLANS {
        string id PK
        string name
        string plan_code UK
        string frequency
        decimal base_price
        integer min_quantity
        date start_date
        date end_date
        boolean auto_close_on_expiry
    }

    QUOTATION_TEMPLATES {
        string id PK
        string name
        string plan_id FK
        integer validity_days
        string payment_terms
    }

    QUOTATIONS {
        string id PK
        string quotation_number UK
        string customer_id FK
        string plan_id FK
        string status
        date valid_until
        decimal subtotal
        decimal tax_amount
        decimal discount_amount
        decimal total_amount
    }

    QUOTATION_LINES {
        string id PK
        string quotation_id FK
        string product_id FK
        string variant_id FK
        integer quantity
        decimal unit_price
        decimal tax_amount
        decimal line_total
    }

    SUBSCRIPTIONS {
        string id PK
        string subscription_number UK
        string customer_id FK
        string plan_id FK
        string status
        string billing_frequency
        date start_date
        date expiry_date
        date next_billing_date
        decimal total_recurring_amount
    }

    SUBSCRIPTION_LINES {
        string id PK
        string subscription_id FK
        string product_id FK
        string variant_id FK
        integer quantity
        decimal unit_price
        decimal tax_amount
        decimal line_total
    }

    INVOICES {
        string id PK
        string invoice_number UK
        string subscription_id FK
        string customer_id FK
        string status
        date billing_period_start
        date billing_period_end
        date due_date
        decimal total_amount
        decimal amount_paid
        decimal balance
    }

    INVOICE_LINES {
        string id PK
        string invoice_id FK
        string product_id FK
        string variant_id FK
        integer quantity
        decimal unit_price
        decimal tax_amount
        decimal line_total
    }

    PAYMENTS {
        string id PK
        string payment_number UK
        string invoice_id FK
        string customer_id FK
        string payment_method
        decimal amount
        timestamp payment_date
        string transaction_reference
    }

    TAX_RULES {
        string id PK
        string name
        string code UK
        decimal rate
        string tax_type
        boolean is_active
    }

    DISCOUNT_RULES {
        string id PK
        string code UK
        string discount_type
        decimal discount_value
        decimal min_purchase_amount
        integer min_quantity
        string scope
        date start_date
        date end_date
        integer max_usage
        integer usage_count
        boolean is_active
    }

    SUBSCRIPTION_AUDIT_LOGS {
        string id PK
        string subscription_id FK
        string user_id FK
        string action
        string previous_status
        string new_status
        timestamp timestamp
    }
```

---

## 2. Relational Cardinalities & Business Rules

1. **User to Customer (1 : 0..1)**:
   - A `user` with role `customer` maps to exactly one `customer` profile.
   - Staff and Admin users have `user_id` in users without an attached customer profile.
2. **Product to Variant (1 : N)**:
   - Base products can have zero or more variants. Each variant specifies an additive price adjustment (`price_offset`).
   - Selecting a variant automatically combines base product price + offset.
3. **Quotation to Subscription (0..1 : 1)**:
   - A quotation can convert into exactly one subscription. 
   - A subscription can also be directly spawned by Staff without an initial formal quote if an immediate contract is deployed.
4. **Subscription to Invoices (1 : N)**:
   - A subscription generates an ongoing series of recurring invoices over its lifetime.
   - The compound constraint `(subscription_id, billing_period_start)` guarantees that for any specific billing interval, exactly one invoice can exist.
5. **Invoice to Payments (1 : N)**:
   - An invoice can be reconciled across multiple payments (partial payments allowed).
   - Once the sum of payments equals or exceeds `invoices.total_amount`, the invoice transitions to `Paid`.

