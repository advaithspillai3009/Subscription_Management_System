import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (user && !requireRole(user, ["admin", "staff"])) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = params;

    const quote = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "Quotation not found." },
        { status: 404 }
      );
    }

    if (quote.status === "converted") {
      return NextResponse.json(
        { error: "Quotation has already been converted to a subscription." },
        { status: 400 }
      );
    }

    const subNumber = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expiry = new Date(now);
    if (quote.plan.frequency === "yearly") {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }

    // Convert atomically
    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          subscriptionNumber: subNumber,
          customerId: quote.customerId,
          planId: quote.planId,
          status: "active",
          billingFrequency: quote.plan.frequency,
          startDate: now,
          expiryDate: expiry,
          nextBillingDate: expiry,
          paymentTerms: quote.paymentTerms,
          subtotal: quote.subtotal,
          taxAmount: quote.taxAmount,
          discountAmount: quote.discountAmount,
          totalRecurringAmount: quote.totalAmount,
          notes: `Converted from Quotation ${quote.quotationNumber}`,
          lines: {
            create: quote.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId,
              description: l.description,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              taxRate: l.taxRate,
              taxAmount: l.taxAmount,
              discountAmount: l.discountAmount,
              lineTotal: l.lineTotal,
            })),
          },
        },
      });

      await tx.quotation.update({
        where: { id: quote.id },
        data: {
          status: "converted",
          convertedSubscriptionId: subscription.id,
        },
      });

      await tx.subscriptionAuditLog.create({
        data: {
          subscriptionId: subscription.id,
          userId: user?.id || null,
          action: "CONVERTED_FROM_QUOTATION",
          newStatus: "active",
          notes: `Generated from Quotation ${quote.quotationNumber}`,
        },
      });

      return subscription;
    });

    return NextResponse.json({ success: true, subscription: result });
  } catch (error) {
    console.error("Quote conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert quotation to subscription." },
      { status: 500 }
    );
  }
}
