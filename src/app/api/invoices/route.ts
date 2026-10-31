import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
        { invoiceNumber: { contains: search } },
        { customer: { companyName: { contains: search } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: true,
        subscription: true,
        lines: {
          include: {
            product: true,
            variant: true,
          },
        },
        payments: true,
      },
      orderBy: { issueDate: "desc" },
    });

    const sanitizedInvoices = invoices.map((inv) => ({
      ...inv,
      paidAmount: typeof inv.amountPaid === "number" ? inv.amountPaid : 0,
      balance: typeof inv.balance === "number" ? inv.balance : Math.max(0, inv.totalAmount - (inv.amountPaid || 0)),
    }));

    return NextResponse.json({ success: true, invoices: sanitizedInvoices });
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve invoices." },
      { status: 500 }
    );
  }
}
