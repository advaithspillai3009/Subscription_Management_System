import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
    });

    const discounts = await prisma.discountRule.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products, plans, discounts });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve product catalog." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user && !requireRole(user, ["admin"])) {
      return NextResponse.json(
        { error: "Admin role required to manage products." },
        { status: 403 }
      );
    }

    const { name, productCode, type, salesPrice, costPrice, notes } = await req.json();

    const product = await prisma.product.create({
      data: {
        name,
        productCode: productCode || `PKG-${Date.now()}`,
        type: type || "saas_platform",
        salesPrice: parseFloat(salesPrice),
        costPrice: parseFloat(costPrice || 0),
        notes: notes || null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
