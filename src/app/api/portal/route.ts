import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    // If customer, fetch their customer profile
    let customerId = user?.customerId;

    // If no session or not linked (e.g. testing), allow fallback to the first seeded customer
    if (!customerId) {
      const firstCustomer = await prisma.customer.findFirst({
        include: { user: true },
      });
      if (firstCustomer) {
        customerId = firstCustomer.id;
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "No customer profile found." },
        { status: 404 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        subscriptions: {
          include: {
            plan: true,
            lines: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        invoices: {
          include: {
            lines: {
              include: {
                product: true,
                variant: true,
              },
            },
            payments: true,
          },
          orderBy: { issueDate: "desc" },
        },
        payments: {
          include: {
            invoice: true,
          },
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer record not found." },
        { status: 404 }
      );
    }

    const sanitizedInvoices = customer.invoices.map((inv) => ({
      ...inv,
      paidAmount: typeof inv.amountPaid === "number" ? inv.amountPaid : 0,
      balance: typeof inv.balance === "number" ? inv.balance : Math.max(0, inv.totalAmount - (inv.amountPaid || 0)),
    }));

    return NextResponse.json({
      success: true,
      customer: {
        ...customer,
        invoices: sanitizedInvoices,
      },
    });
  } catch (error) {
    console.error("Fetch portal error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve customer portal data." },
      { status: 500 }
    );
  }
}
