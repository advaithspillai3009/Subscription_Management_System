/**
 * Brightloop Automated Billing Engine & Telemetry Latency Benchmark Suite
 * Verifies:
 * 1. Zero Duplicate Invoicing (Idempotent Billing Pipeline)
 * 2. Financial Telemetry Latency (< 2.0 seconds requirement)
 * 3. Password Security Policy Validation
 */

import { prisma } from "../src/lib/prisma";
import { executeScheduledBilling } from "../src/lib/billing";
import { getLiveTelemetry } from "../src/lib/telemetry";
import { validatePasswordPolicy } from "../src/lib/auth";

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("   BRIGHTLOOP AUTOMATED VERIFICATION & BENCHMARK SUITE");
  console.log("========================================================\n");

  // TEST 1: Password Policy
  console.log("[TEST 1] Verifying Password Security Policy...");
  const validPass = validatePasswordPolicy("Brightloop@2026!");
  const shortPass = validatePasswordPolicy("Short1!");
  const noUpperPass = validatePasswordPolicy("lowercase@1234");
  const noSpecialPass = validatePasswordPolicy("NoSpecial12345");

  if (!validPass.valid) throw new Error("Valid password was incorrectly rejected");
  if (shortPass.valid) throw new Error("Short password was incorrectly accepted");
  if (noUpperPass.valid) throw new Error("No-uppercase password was incorrectly accepted");
  if (noSpecialPass.valid) throw new Error("No-special-char password was incorrectly accepted");
  console.log("  ✓ Password policy correctly validated 4 edge cases.\n");

  // TEST 2: Latency Benchmark
  console.log("[TEST 2] Benchmarking Financial Telemetry Latency (< 2.0s Hackathon SLA)...");
  const t0 = performance.now();
  const telemetry = await getLiveTelemetry();
  const t1 = performance.now();
  const latencyMs = Math.round(t1 - t0);

  console.log(`  Telemetry Result:`);
  console.log(`    - MRR: ₹${Math.round(telemetry.contractedMRR).toLocaleString("en-IN")}`);
  console.log(`    - ARR: ₹${Math.round(telemetry.contractedARR).toLocaleString("en-IN")}`);
  console.log(`    - Total Customers: ${telemetry.totalCustomers}`);
  console.log(`    - Active Subscriptions: ${telemetry.activeSubscriptions}`);
  console.log(`    - Cash Collected: ₹${Math.round(telemetry.totalCashCollected).toLocaleString("en-IN")}`);
  console.log(`    - Execution Latency: ${latencyMs}ms`);

  if (latencyMs > 2000) {
    throw new Error(`Telemetry latency (${latencyMs}ms) exceeded 2000ms threshold!`);
  }
  console.log(`  ✓ Performance SLA PASSED: ${latencyMs}ms << 2000ms limit.\n`);

  // TEST 3: Idempotent Billing Engine & Zero-Duplicate Guarantee
  console.log("[TEST 3] Testing Automated Billing Engine & Idempotency Guarantee...");
  
  // Count current invoices
  const initialInvoiceCount = await prisma.invoice.count();
  console.log(`  Initial invoice count in database: ${initialInvoiceCount}`);

  // First execution
  console.log("  Running Billing Cycle Execution 1...");
  const run1 = await executeScheduledBilling();
  console.log(`  Run 1 generated: ${run1.generatedCount} invoices, duplicate-prevented: ${run1.skippedDuplicateCount}`);

  // Re-run immediately for the same billing period
  console.log("  Running Billing Cycle Execution 2 (Immediate Re-trigger)...");
  const run2 = await executeScheduledBilling();
  console.log(`  Run 2 generated: ${run2.generatedCount} invoices, duplicate-prevented: ${run2.skippedDuplicateCount}`);

  if (run2.generatedCount > 0) {
    throw new Error(
      `CRITICAL FAILURE: Duplicate billing occurred! Generated ${run2.generatedCount} duplicate invoices on re-run.`
    );
  }
  console.log("  ✓ IDEMPOTENCY CONFIRMED: 0 duplicate invoices generated on re-run.\n");

  console.log("========================================================");
  console.log("   ALL AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY! ");
  console.log("========================================================\n");
}

runTestSuite()
  .catch((err) => {
    console.error("Test Suite Failure:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
