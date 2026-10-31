import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const discounts = await prisma.discountRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, discounts });
  } catch (error) {
    console.error("Fetch discounts error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve discount rules." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user && !requireRole(user, ["admin"])) {
      return NextResponse.json(
        { error: "Only administrators can create discount rules." },
        { status: 403 }
      );
    }

    const {
      code,
      description,
      discountType,
      value,
      validFrom,
      validUntil,
      minPurchaseAmount,
      maxDiscountAmount,
    } = await req.json();

    if (!code || !discountType || value === undefined) {
      return NextResponse.json(
        { error: "Promo code, discount type, and value are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.discountRule.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Discount rule with code ${code.toUpperCase()} already exists.` },
        { status: 400 }
      );
    }

    const discount = await prisma.discountRule.create({
      data: {
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        value: parseFloat(value),
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, discount }, { status: 201 });
  } catch (error) {
    console.error("Create discount error:", error);
    return NextResponse.json(
      { error: "Failed to create discount rule." },
      { status: 500 }
    );
  }
}
