import { NextResponse } from "next/server";
import { executeScheduledBilling } from "@/lib/billing";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser();
    // Allow admin or staff, or default developer session
    if (user && !requireRole(user, ["admin", "staff"])) {
      return NextResponse.json(
        { error: "Insufficient permissions to run batch billing." },
        { status: 403 }
      );
    }

    const result = await executeScheduledBilling();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Batch billing execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute batch billing." },
      { status: 500 }
    );
  }
}
