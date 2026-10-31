import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const user = await getCurrentUser();

    const whereClause: any = {};

    // Multi-tenant check: if customer, restrict strictly to their own customerId
    if (user && user.role === "customer" && user.customerId) {
      whereClause.customerId = user.customerId;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { subscriptionNumber: { contains: search } },
        { customer: { companyName: { contains: search } } },
      ];
    }

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
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

    return NextResponse.json({ success: true, subscriptions });
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve subscriptions." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, planId, billingFrequency, startDate, lines } = body;

    const subNumber = `SUB-${Math.floor(1000 + Math.random() * 9000)}`;

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const start = new Date(startDate || new Date());
    const nextBilling = new Date(start);

    // Calculate lines and tax
    let subtotal = 0;
    let taxAmount = 0;

    const lineItemsData = (lines || []).map((line: any) => {
      const lineSubtotal = line.unitPrice * line.quantity;
      const lineTax = lineSubtotal * 0.18; // GST 18%
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
        lineTotal: Math.round((lineSubtotal + lineTax) * 100) / 100,
      };
    });

    const totalRecurringAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const subscription = await prisma.subscription.create({
      data: {
        subscriptionNumber: subNumber,
        customerId,
        planId,
        status: "active",
        billingFrequency: billingFrequency || plan.frequency,
        startDate: start,
        nextBillingDate: nextBilling,
        paymentTerms: "Net 15",
        subtotal,
        taxAmount,
        totalRecurringAmount,
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

    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Failed to deploy subscription." },
      { status: 500 }
    );
  }
}
