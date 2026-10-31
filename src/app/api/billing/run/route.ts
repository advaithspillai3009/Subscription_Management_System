import { NextResponse } from "next/server";
import { executeScheduledBilling } from "@/lib/billing";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // Allow admin or staff, or default developer session
    if (user && !requireRole(user, ["admin", "staff"])) {
      return NextResponse.json(
        { error: "Insufficient permissions to run batch billing." },
        { status: 403 }
      );
    }

    let targetDate = new Date();
    try {
      const body = await req.json();
      if (body?.runDate) {
        targetDate = new Date(body.runDate);
      } else if (body?.advanceDays) {
        targetDate = new Date(Date.now() + body.advanceDays * 24 * 60 * 60 * 1000);
      }
    } catch {
      // Optional body
    }

    const result = await executeScheduledBilling(targetDate);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Batch billing execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute batch billing." },
      { status: 500 }
    );
  }
}
