# SETUP, INSTALLATION & LOCAL EXECUTION GUIDE
## Brightloop – Subscription Management System

---

## 1. System Prerequisites

Brightloop is engineered to run seamlessly across all operating systems (Windows, macOS, Linux) with zero heavy external runtime requirements.

- **Python**: Version 3.10, 3.11, 3.12, 3.13, or 3.14 (Verified active: **Python 3.14.7**).
- **Package Manager**: `pip` (pre-installed).
- **Browser**: Any modern evergreen web browser (Chrome, Firefox, Safari, Edge).
- **Storage**: SQLite 3 (built-in standard library) or PostgreSQL 15+.

---

## 2. Quick-Start Setup (Under 2 Minutes)

### Step 1: Clone or Navigate to the Repository
```bash
git clone https://github.com/advaithspillai3009/Subscription_Management_System.git
cd Subscription_Management_System
```

### Step 2: Environment Configuration
Create a `.env` file in the project root (a default `.env.example` is provided):
```env
# Application Settings
APP_NAME="Brightloop Subscription Management"
APP_ENV="development"
DEBUG=True
PORT=8000
HOST="127.0.0.1"

# Security & Sessions
SECRET_KEY="brightloop-super-secret-cryptographic-key-change-in-prod"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database Configuration (SQLite default; can point to PostgreSQL)
DATABASE_URL="sqlite:///./brightloop.db"

# Optional Email / SMTP Provider (Leave blank for simulation mode)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM_EMAIL="noreply@brightloop.software"
```

### Step 3: Install Required Dependencies
All primary dependencies (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `bcrypt`, `pyjwt`, `reportlab`) are typically pre-installed in the development environment. To verify or install cleanly:
```bash
pip install -r requirements.txt
```

### Step 4: Initialize & Seed the Database
Initialize the schema and populate the database with realistic Indian enterprise SaaS data:
```bash
python scripts/seed_database.py
```
This automatically seeds:
- Default Admin account: `admin@brightloop.software` / `Admin@2026!`
- Default Staff account: `staff@brightloop.software` / `Staff@2026!`
- Default Customer account: `finance@razorpay.com` / `Customer@2026!`
- Products, variants (including **Odoo Brand +₹560**), plans, customers, active subscriptions, overdue invoices, and telemetry.

### Step 5: Launch the Brightloop Server
```bash
python -m uvicorn main:app --reload --port 8000
```
Open your browser to:
- **Application Portal**: `http://localhost:8000`
- **Interactive OpenAPI / Swagger Documentation**: `http://localhost:8000/docs`
- **Alternative ReDoc**: `http://localhost:8000/redoc`

---

## 3. Seed Accounts & Login Credentials

| Role | Email Address | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.software` | `Admin@2026!` | Master System Control, Taxes, Discounts, Staff |
| **Staff** | `staff@brightloop.software` | `Staff@2026!` | Day-to-Day Operations, Quotes, Invoices, Payments |
| **Customer** | `finance@razorpay.com` | `Customer@2026!` | Customer Self-Service Portal (Tenant Isolated) |

---

## 4. Verification & Testing Commands

```bash
# Run all automated tests
pytest tests/ -v

# Run the duplicate billing prevention test
pytest tests/test_billing_idempotency.py -v

# Run latency benchmark (< 2s SLA verification)
python tests/benchmark_latency.py
```

---

## 5. Deployment Options

### Option A: Standard Standalone Local Execution (Recommended for Hackathons)
Run natively via Uvicorn on localhost. Completely offline-capable with zero internet dependencies during demonstration.

### Option B: Cloud Hosting (Render / Railway / Fly.io)
Deploy in one command via Dockerfile or Python buildpack:
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Option C: Containerized Deployment (Docker)
```dockerfile
FROM python:3.14-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

