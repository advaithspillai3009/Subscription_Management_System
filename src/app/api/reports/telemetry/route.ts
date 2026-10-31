import { NextResponse } from "next/server";
import { getLiveTelemetry } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const telemetry = await getLiveTelemetry();
    return NextResponse.json({ success: true, telemetry });
  } catch (error) {
    console.error("Telemetry query error:", error);
    return NextResponse.json(
      { error: "Failed to calculate telemetry metrics." },
      { status: 500 }
    );
  }
}
