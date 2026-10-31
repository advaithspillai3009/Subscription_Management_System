# USER ROLES & ACCESS CONTROL (RBAC) MATRIX
## Brightloop – Subscription Management System

---

## 1. RBAC Architectural Principles

Brightloop enforces **multi-layered, server-side Role-Based Access Control (RBAC)**. Security is not delegated to the client interface:
1. **Zero Trust API Boundaries**: Every backend endpoint verifies authentication and explicit role capabilities before invoking domain logic.
2. **Strict Multi-Tenant Customer Isolation**: Customer role queries are strictly scoped by the database:
   $$\text{WHERE customer\_id} = \text{session.user.customer\_id}$$
   Zero possibility of horizontal privilege escalation or viewing competitor data.
3. **Privilege Segregation**: Sensitive commercial policies (staff provisioning, tax rate changes, and discount creation) are strictly reserved for the **Admin** role.

---

## 2. Comprehensive Permissions Matrix

The table below maps all application operations across user roles:

| Domain Module | Operation / Action | Admin | Staff | Customer | Backend Enforcement Rule |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Authentication** | Register customer account | Yes | No | Public | Public registration endpoint |
| | Login / Logout | Yes | Yes | Yes | Validates credentials & issues session |
| | Request password reset | Yes | Yes | Yes | Generates secure time-bounded token |
| **Staff Governance** | Create new staff account | **Yes** | **No** | **No** | `require_role('admin')` |
| | Edit staff profile / roles | **Yes** | **No** | **No** | `require_role('admin')` |
| | Deactivate staff member | **Yes** | **No** | **No** | `require_role('admin')` |
| **Customer Directory** | View all customers | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Create new customer profile | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Edit customer details | Yes | Yes | Self Only | Customer edits own profile only |
| **Products & Variants** | View active products & variants | Yes | Yes | Read Only | Filtered active catalog |
| | Create new product | **Yes** | **No** | **No** | `require_role('admin')` |
| | Edit product / price / notes | **Yes** | **No** | **No** | `require_role('admin')` |
| | Attach / modify variants (Odoo +₹560) | **Yes** | **No** | **No** | `require_role('admin')` |
| | Deactivate / archive product | **Yes** | **No** | **No** | `require_role('admin')` |
| **Plans & Pricing** | View active subscription plans | Yes | Yes | Read Only | Available public tiers |
| | Create new plan (cadence, rules) | **Yes** | **No** | **No** | `require_role('admin')` |
| | Edit plan parameters / auto-close | **Yes** | **No** | **No** | `require_role('admin')` |
| | Deactivate plan | **Yes** | **No** | **No** | `require_role('admin')` |
| **Quotations** | View all quotation records | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Create quotation from template | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Send quotation to customer | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Convert quotation to subscription | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| **Subscriptions** | View full subscription ledger | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | View personal active subscriptions | Yes | Yes | Self Only | `WHERE customer_id == session.customer_id` |
| | Deploy new subscription | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Pause / Resume subscription | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Renew subscription contract | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Early close subscription | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | View subscription audit log | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| **Invoices & Billing** | View complete invoice ledger | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | View personal invoices | Yes | Yes | Self Only | `WHERE customer_id == session.customer_id` |
| | Trigger automated billing run | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Confirm draft invoice | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Cancel invoice | **Yes** | **No** | **No** | `require_role('admin')` (Admin audit check) |
| | Download invoice PDF | Yes | Yes | Self Only | Stream authenticated PDF |
| **Tax Rules** | View tax rules | Yes | Yes | Read Only | Read active tax table |
| | Create / update tax rates (GST) | **Yes** | **No** | **No** | `require_role('admin')` |
| **Discount Rules** | View discount rules & redemptions | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | Create new discount rule (% / fixed) | **Yes** | **No** | **No** | `require_role('admin')` |
| | Update / deactivate discount rule | **Yes** | **No** | **No** | `require_role('admin')` |
| **Payments** | View payments ledger | Yes | Yes | Self Only | Multi-tenant filtered |
| | Record payment against invoice | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| **Reports & Telemetry** | View live MRR / ARR telemetry | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |
| | View detailed revenue forecasting | **Yes** | **No** | **No** | `require_role('admin')` |
| | View billing exception & churn risk | Yes | Yes | **No** | `require_role(['admin', 'staff'])` |

---

## 3. Backend Enforcement Architecture

In the FastAPI backend, role protection is implemented through reusable dependency injection guards:

```python
from fastapi import Depends, HTTPException, status
from models.user import User
from services.auth_service import get_current_user

def require_role(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="User account is deactivated."
            )
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Operation requires one of the following roles: {allowed_roles}"
            )
        return current_user
    return role_checker

# Usage Examples on Protected Routes:
# @router.post("/staff", dependencies=[Depends(require_role(["admin"]))])
# @router.post("/discounts", dependencies=[Depends(require_role(["admin"]))])
# @router.post("/quotations", dependencies=[Depends(require_role(["admin", "staff"]))])
```

### Customer Scoping Guard
When an endpoint is accessed by a user with the `customer` role, the query repository enforces an automatic tenant filter:
```python
def get_customer_scoped_query(query, current_user: User):
    if current_user.role == "customer":
        if not current_user.customer_id:
            raise HTTPException(status_code=403, detail="No customer profile attached.")
        return query.filter(Invoice.customer_id == current_user.customer_id)
    return query
```
This guarantees mathematical certainty that a customer cannot intercept, view, or modify any other account's financial records.
