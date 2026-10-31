import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Brightloop Database Seeding...");

  // 1. Clean existing records in correct referential order
  await prisma.subscriptionAuditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionLine.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.quotationLine.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.quotationTemplate.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.product.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing tables.");

  // 2. Create Users
  const adminPassword = await bcrypt.hash("Admin@2026!", 10);
  const staffPassword = await bcrypt.hash("Staff@2026!", 10);
  const customerPassword = await bcrypt.hash("Customer@2026!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@brightloop.software",
      passwordHash: adminPassword,
      fullName: "Advaith Pillai (Admin)",
      role: "admin",
      isActive: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@brightloop.software",
      passwordHash: staffPassword,
      fullName: "Ashwin Girish (Staff)",
      role: "staff",
      isActive: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "finance@razorpay.com",
      passwordHash: customerPassword,
      fullName: "Arjun Nair (Razorpay Finance)",
      role: "customer",
      isActive: true,
    },
  });

  console.log("👤 Created Admin, Staff, and Customer users.");

  // 3. Tax Rules
  const gst18 = await prisma.taxRule.create({
    data: {
      name: "GST 18% (CGST 9% + SGST 9%)",
      code: "GST_18",
      rate: 18.0,
      taxType: "exclusive",
      isActive: true,
    },
  });

  const gst12 = await prisma.taxRule.create({
    data: {
      name: "GST 12%",
      code: "GST_12",
      rate: 12.0,
      taxType: "exclusive",
      isActive: true,
    },
  });

  const exempt = await prisma.taxRule.create({
    data: {
      name: "Exempt / Zero Rated (0%)",
      code: "EXEMPT",
      rate: 0.0,
      taxType: "exclusive",
      isActive: true,
    },
  });

  console.log("🏷️ Created GST tax rules.");

  // 4. Products & Variants (with Odoo Brand +₹560)
  const coreEngine = await prisma.product.create({
    data: {
      name: "Brightloop Core Recurring Engine",
      productCode: "PKG-CORE-BASE",
      type: "saas_platform",
      salesPrice: 18000.0,
      costPrice: 4200.0,
      notes: "Base platform infrastructure for multi-tier subscription orchestration.",
      isActive: true,
    },
  });

  // Attach Odoo Brand variant with +₹560 price offset
  const odooVariant = await prisma.productVariant.create({
    data: {
      productId: coreEngine.id,
      variantName: "Odoo Brand Integration",
      attributeType: "brand",
      priceOffset: 560.0, // Exactly as specified in Problem Statement
      isActive: true,
    },
  });

  const standardVariant = await prisma.productVariant.create({
    data: {
      productId: coreEngine.id,
      variantName: "Standard SaaS Edition",
      attributeType: "brand",
      priceOffset: 0.0,
      isActive: true,
    },
  });

  const orionSeats = await prisma.product.create({
    data: {
      name: "AI Workflow Automations - ORION",
      productCode: "PKG-ORION-SEAT",
      type: "metered_service",
      salesPrice: 450.0,
      costPrice: 80.0,
      notes: "Metered per-seat AI agent with 14ms low-bank-latency dunning triggers.",
      isActive: true,
    },
  });

  const apiGateway = await prisma.product.create({
    data: {
      name: "High-Throughput Dedicated API Gateway",
      productCode: "PKG-GATEWAY-DEDICATED",
      type: "saas_platform",
      salesPrice: 75000.0,
      costPrice: 18000.0,
      notes: "Dedicated VPC tenant with 99.99% SLA guarantee in Mumbai region.",
      isActive: true,
    },
  });

  const gstConnector = await prisma.product.create({
    data: {
      name: "Automated GST e-Invoicing Connector",
      productCode: "PKG-GST-NIC-SYNC",
      type: "addon_module",
      salesPrice: 12000.0,
      costPrice: 1500.0,
      notes: "Direct real-time NIC GSP sync with IRN and QR code embedding.",
      isActive: true,
    },
  });

  const fxModule = await prisma.product.create({
    data: {
      name: "Global Multi-Currency FX Module",
      productCode: "PKG-FX-CROSSBORDER",
      type: "addon_module",
      salesPrice: 25000.0,
      costPrice: 5000.0,
      notes: "Cross-border settlement escrow and multi-currency billing.",
      isActive: true,
    },
  });

  console.log("📦 Created Products and Additive Variants (Odoo Brand +₹560).");

  // 5. Plans
  const starterPlan = await prisma.plan.create({
    data: {
      name: "Starter Core",
      planCode: "PLAN-STARTER",
      description: "Essential recurring engine for bootstrapped SaaS and nascent Indian market entries.",
      frequency: "monthly",
      basePrice: 6500.0,
      minQuantity: 1,
      autoCloseOnExpiry: false,
      isActive: true,
    },
  });

  const growthPlan = await prisma.plan.create({
    data: {
      name: "Growth Tier",
      planCode: "PLAN-GROWTH",
      description: "Autonomous dunning, multi-channel payment recovery, and mid-market billing.",
      frequency: "monthly",
      basePrice: 18000.0,
      minQuantity: 5,
      autoCloseOnExpiry: false,
      isActive: true,
    },
  });

  const scalePlan = await prisma.plan.create({
    data: {
      name: "Scale Automation",
      planCode: "PLAN-SCALE",
      description: "Complex child ledger hierarchies, e-Invoice generation, and multi-tenant logic.",
      frequency: "monthly",
      basePrice: 45000.0,
      minQuantity: 10,
      autoCloseOnExpiry: false,
      isActive: true,
    },
  });

  const enterprisePlan = await prisma.plan.create({
    data: {
      name: "Enterprise Custom",
      planCode: "PLAN-ENTERPRISE",
      description: "Unlimited scale with dedicated virtual private cloud infrastructure and custom SLA.",
      frequency: "yearly",
      basePrice: 240000.0, // Yearly
      minQuantity: 25,
      autoCloseOnExpiry: false,
      isActive: true,
    },
  });

  console.log("📋 Created Recurring Plans (Starter, Growth, Scale, Enterprise).");

  // 6. Discount Rules
  await prisma.discountRule.create({
    data: {
      code: "ANNUAL25",
      description: "25% Off Annual Prepayments on all enterprise plans",
      discountType: "percentage",
      discountValue: 25.0,
      minPurchaseAmount: 100000.0,
      minQuantity: 1,
      scope: "subscription",
      maxUsage: 100,
      usageCount: 88,
      isActive: true,
    },
  });

  await prisma.discountRule.create({
    data: {
      code: "FINTECH_ACCEL",
      description: "₹20,000 Founder / YC cohort credit on Growth or Scale tiers",
      discountType: "fixed",
      discountValue: 20000.0,
      minPurchaseAmount: 40000.0,
      minQuantity: 1,
      scope: "subscription",
      maxUsage: 50,
      usageCount: 24,
      isActive: true,
    },
  });

  await prisma.discountRule.create({
    data: {
      code: "ENTERPRISE_MIGRATION",
      description: "100% Onboarding fee waiver of ₹1,50,000 for multi-year contracts",
      discountType: "fixed",
      discountValue: 150000.0,
      minPurchaseAmount: 500000.0,
      minQuantity: 1,
      scope: "subscription",
      maxUsage: 20,
      usageCount: 12,
      isActive: true,
    },
  });

  console.log("🎟️ Created Promotional & Discount Rules.");

  // 7. Customers (Matching the Stitch Design)
  const razorpay = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      companyName: "Razorpay Integration Ltd",
      contactName: "Arjun Nair",
      email: "finance@razorpay.com",
      phone: "+91 80 4718 1234",
      gstin: "29AABCR1234F1Z5",
      billingStreet: "SJR Cyber, Hosur Road",
      billingCity: "Bengaluru",
      billingState: "Karnataka",
      billingPostalCode: "560029",
      billingCountry: "India",
      status: "active",
    },
  });

  const zenith = await prisma.customer.create({
    data: {
      companyName: "Zenith Logistics Tech",
      contactName: "Priya Sharma",
      email: "accounts@zenithlogistics.in",
      phone: "+91 22 2839 5678",
      gstin: "27AAACZ1234A1Z1",
      billingStreet: "Bandra Kurla Complex",
      billingCity: "Mumbai",
      billingState: "Maharashtra",
      billingPostalCode: "400051",
      billingCountry: "India",
      status: "active",
    },
  });

  const indus = await prisma.customer.create({
    data: {
      companyName: "Indus FinTech Labs",
      contactName: "Rohan Varma",
      email: "billing@indusfintech.com",
      phone: "+91 40 6677 8899",
      gstin: "36AAACI1234B1Z2",
      billingStreet: "HITEC City, Madhapur",
      billingCity: "Hyderabad",
      billingState: "Telangana",
      billingPostalCode: "500081",
      billingCountry: "India",
      status: "active",
    },
  });

  const hyperlocal = await prisma.customer.create({
    data: {
      companyName: "HyperLocal Commerce",
      contactName: "Sneha Kapur",
      email: "finance@hyperlocal.co",
      phone: "+91 124 456 7890",
      gstin: "06AAACH1234C1Z3",
      billingStreet: "Cyber City, DLF Phase 2",
      billingCity: "Gurugram",
      billingState: "Haryana",
      billingPostalCode: "122002",
      billingCountry: "India",
      status: "active",
    },
  });

  const cloudscale = await prisma.customer.create({
    data: {
      companyName: "CloudScale Technologies",
      contactName: "Vikram Joshi",
      email: "ops@cloudscale.io",
      phone: "+91 20 4123 4567",
      gstin: "27AAACC1234D1Z4",
      billingStreet: "Magarpatta City",
      billingCity: "Pune",
      billingState: "Maharashtra",
      billingPostalCode: "411028",
      billingCountry: "India",
      status: "active",
    },
  });

  const swasthya = await prisma.customer.create({
    data: {
      companyName: "Swasthya Health Systems",
      contactName: "Dr. Ananya Roy",
      email: "admin@swasthyahealth.org",
      phone: "+91 11 2654 3210",
      gstin: "07AAACS1234E1Z5",
      billingStreet: "Connaught Place",
      billingCity: "New Delhi",
      billingState: "Delhi",
      billingPostalCode: "110001",
      billingCountry: "India",
      status: "active",
    },
  });

  const urbanmobility = await prisma.customer.create({
    data: {
      companyName: "UrbanMobility Fleet",
      contactName: "Karthik Subramanian",
      email: "fleet@urbanmobility.in",
      phone: "+91 44 2812 3456",
      gstin: "33AAACU1234F1Z6",
      billingStreet: "OMR IT Highway",
      billingCity: "Chennai",
      billingState: "Tamil Nadu",
      billingPostalCode: "600096",
      billingCountry: "India",
      status: "active",
    },
  });

  const bharatagri = await prisma.customer.create({
    data: {
      companyName: "Bharat AgriTech AI",
      contactName: "Manoj Choudhary",
      email: "contact@bharatagri.ai",
      phone: "+91 731 254 7890",
      gstin: "23AAACB1234G1Z7",
      billingStreet: "Vijay Nagar",
      billingCity: "Indore",
      billingState: "Madhya Pradesh",
      billingPostalCode: "452010",
      billingCountry: "India",
      status: "active",
    },
  });

  console.log("🏢 Created Indian B2B Enterprise Customers.");

  // 8. Subscriptions
  // Sub 1: Razorpay (Active, Enterprise Custom, ₹2,40,000/yr)
  const sub1 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-9821",
      customerId: razorpay.id,
      planId: enterprisePlan.id,
      status: "active",
      billingFrequency: "yearly",
      startDate: new Date("2025-11-15"),
      expiryDate: new Date("2026-11-15"),
      nextBillingDate: new Date("2026-11-15"),
      lastBillingDate: new Date("2025-11-15"),
      paymentTerms: "Net 15",
      subtotal: 240000.0,
      taxAmount: 43200.0, // 18%
      totalRecurringAmount: 283200.0,
      notes: "Annual prepaid contract with unlimited webhooks.",
    },
  });

  await prisma.subscriptionLine.create({
    data: {
      subscriptionId: sub1.id,
      productId: coreEngine.id,
      variantId: odooVariant.id, // Odoo Brand +₹560
      description: "Brightloop Core Recurring Engine (Odoo Edition)",
      quantity: 1,
      unitPrice: 18560.0,
      taxRate: 18.0,
      taxAmount: 3340.8,
      lineTotal: 21900.8,
    },
  });

  await prisma.subscriptionLine.create({
    data: {
      subscriptionId: sub1.id,
      productId: apiGateway.id,
      description: "High-Throughput Dedicated API Gateway",
      quantity: 1,
      unitPrice: 75000.0,
      taxRate: 18.0,
      taxAmount: 13500.0,
      lineTotal: 88500.0,
    },
  });

  // Sub 2: Zenith Logistics Tech (Active, Scale, ₹85,000/mo)
  const sub2 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-9822",
      customerId: zenith.id,
      planId: scalePlan.id,
      status: "active",
      billingFrequency: "monthly",
      startDate: new Date("2026-10-04"),
      nextBillingDate: new Date("2026-11-04"),
      lastBillingDate: new Date("2026-10-04"),
      paymentTerms: "Net 15",
      subtotal: 85000.0,
      taxAmount: 15300.0,
      totalRecurringAmount: 100300.0,
      notes: "Seat-based logistics tracking across 85 dispatch users.",
    },
  });

  // Sub 3: Indus FinTech Labs (In Grace / Warning, ₹1,45,000/mo)
  const sub3 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-9823",
      customerId: indus.id,
      planId: enterprisePlan.id,
      status: "active",
      billingFrequency: "monthly",
      startDate: new Date("2026-09-30"),
      nextBillingDate: new Date("2026-10-31"), // Due today!
      lastBillingDate: new Date("2026-09-30"),
      paymentTerms: "Net 15",
      subtotal: 145000.0,
      taxAmount: 26100.0,
      totalRecurringAmount: 171100.0,
      notes: "In grace (3 days past due). Razorpay webhook timeout.",
    },
  });

  // Sub 4: HyperLocal Commerce (Active, Growth, ₹18,000/mo)
  const sub4 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-9824",
      customerId: hyperlocal.id,
      planId: growthPlan.id,
      status: "active",
      billingFrequency: "monthly",
      startDate: new Date("2026-10-18"),
      nextBillingDate: new Date("2026-11-18"),
      lastBillingDate: new Date("2026-10-18"),
      paymentTerms: "Net 15",
      subtotal: 18000.0,
      taxAmount: 3240.0,
      totalRecurringAmount: 21240.0,
      notes: "Flat rate + metered overages.",
    },
  });

  // Sub 5: CloudScale Technologies (Active, Scale, ₹22,500/mo)
  const sub5 = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-9825",
      customerId: cloudscale.id,
      planId: growthPlan.id,
      status: "active",
      billingFrequency: "monthly",
      startDate: new Date("2026-10-09"),
      nextBillingDate: new Date("2026-11-09"),
      lastBillingDate: new Date("2026-10-09"),
      paymentTerms: "Net 15",
      subtotal: 22500.0,
      taxAmount: 4050.0,
      totalRecurringAmount: 26550.0,
      notes: "At 92% quota; 1-click scale recommended.",
    },
  });

  console.log("📑 Created Subscriptions matching Stitch Ledger.");

  // 9. Invoices
  // Invoice 1: Razorpay (Paid)
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2025-0001",
      subscriptionId: sub1.id,
      customerId: razorpay.id,
      status: "paid",
      billingPeriodStart: new Date("2025-11-15"),
      billingPeriodEnd: new Date("2026-11-14"),
      issueDate: new Date("2025-11-15"),
      dueDate: new Date("2025-11-30"),
      subtotal: 240000.0,
      taxAmount: 43200.0,
      totalAmount: 283200.0,
      amountPaid: 283200.0,
      balance: 0.0,
      paymentTerms: "Net 15",
      notes: "Annual contract pre-payment via NEFT.",
    },
  });

  // Record Payment for Invoice 1
  await prisma.payment.create({
    data: {
      paymentNumber: "PAY-2025-001",
      invoiceId: inv1.id,
      customerId: razorpay.id,
      paymentMethod: "bank_transfer",
      amount: 283200.0,
      paymentDate: new Date("2025-11-18"),
      transactionReference: "NEFT-HDFC-98218392",
      notes: "Verified against bank settlement.",
      recordedBy: staff.id,
    },
  });

  // Invoice 2: Indus FinTech (Overdue / In Grace, ₹1,45,000 + GST = ₹1,71,100)
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0042",
      subscriptionId: sub3.id,
      customerId: indus.id,
      status: "overdue",
      billingPeriodStart: new Date("2026-09-30"),
      billingPeriodEnd: new Date("2026-10-29"),
      issueDate: new Date("2026-09-30"),
      dueDate: new Date("2026-10-15"),
      subtotal: 145000.0,
      taxAmount: 26100.0,
      totalAmount: 171100.0,
      amountPaid: 0.0,
      balance: 171100.0,
      paymentTerms: "Net 15",
      notes: "3 days past due; automated UPI retry scheduled.",
    },
  });

  // Invoice 3: Zenith Logistics (Confirmed / In Transit Clearance, ₹85,000 + GST = ₹1,00,300)
  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0043",
      subscriptionId: sub2.id,
      customerId: zenith.id,
      status: "confirmed",
      billingPeriodStart: new Date("2026-10-04"),
      billingPeriodEnd: new Date("2026-11-03"),
      issueDate: new Date("2026-10-04"),
      dueDate: new Date("2026-11-04"),
      subtotal: 85000.0,
      taxAmount: 15300.0,
      totalAmount: 100300.0,
      amountPaid: 0.0,
      balance: 100300.0,
      paymentTerms: "Net 15",
      notes: "NACH mandate pending clearance.",
    },
  });

  console.log("💰 Created Invoices and Payment Transactions.");

  console.log("✅ Brightloop Database Seeding Finished Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
