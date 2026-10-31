import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: true,
        plan: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const templates = await prisma.quotationTemplate.findMany({
      include: { plan: true },
    });

    return NextResponse.json({ success: true, quotations, templates });
  } catch (error) {
    console.error("Fetch quotations error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve quotations." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user && !requireRole(user, ["admin", "staff"])) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { customerId, planId, validityDays, paymentTerms, lines, notes } =
      await req.json();

    const quoteNumber = `QT-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (parseInt(validityDays) || 30));

    let subtotal = 0;
    let taxAmount = 0;

    const lineItemsData = (lines || []).map((line: any) => {
      const lineSubtotal = line.unitPrice * line.quantity;
      const lineTax = lineSubtotal * 0.18;
      subtotal += lineSubtotal;
      taxAmount += lineTax;

      return {
        productId: line.productId,
        variantId: line.variantId || null,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: 18.0,
        taxAmount: Math.round(lineTax * 100) / 100,
        discountAmount: 0.0,
        lineTotal: Math.round((lineSubtotal + lineTax) * 100) / 100,
      };
    });

    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: quoteNumber,
        customerId,
        planId,
        status: "sent",
        validityDays: parseInt(validityDays) || 30,
        validUntil,
        paymentTerms: paymentTerms || "Net 15",
        subtotal,
        taxAmount,
        totalAmount,
        notes: notes || null,
        createdBy: user?.id || null,
        lines: {
          create: lineItemsData,
        },
      },
      include: {
        customer: true,
        plan: true,
        lines: true,
      },
    });

    return NextResponse.json({ success: true, quotation }, { status: 201 });
  } catch (error) {
    console.error("Create quotation error:", error);
    return NextResponse.json(
      { error: "Failed to create quotation." },
      { status: 500 }
    );
  }
}
