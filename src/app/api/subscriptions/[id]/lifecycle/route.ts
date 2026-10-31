import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action, reason } = await req.json();
    const { id } = params;

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 }
      );
    }

    let newStatus = sub.status;
    let nextBilling = sub.nextBillingDate;

    if (action === "pause") {
      newStatus = "paused";
    } else if (action === "resume") {
      newStatus = "active";
      // Update next billing date if in past
      if (nextBilling < new Date()) {
        nextBilling = new Date();
      }
    } else if (action === "renew") {
      newStatus = "active";
      const extended = new Date(sub.expiryDate || new Date());
      extended.setFullYear(extended.getFullYear() + 1);
      await prisma.subscription.update({
        where: { id },
        data: { expiryDate: extended },
      });
    } else if (action === "close") {
      newStatus = "closed";
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: newStatus,
        nextBillingDate: nextBilling,
      },
    });

    // Record audit log
    await prisma.subscriptionAuditLog.create({
      data: {
        subscriptionId: id,
        action: action.toUpperCase(),
        previousStatus: sub.status,
        newStatus,
        notes: reason || `Lifecycle transition via ${action}`,
      },
    });

    return NextResponse.json({ success: true, subscription: updated });
  } catch (error) {
    console.error("Subscription lifecycle error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription lifecycle." },
      { status: 500 }
    );
  }
}
