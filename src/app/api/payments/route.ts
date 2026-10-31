import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const whereClause: any = {};

    if (user && user.role === "customer" && user.customerId) {
      whereClause.customerId = user.customerId;
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        customer: true,
        invoice: true,
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json({ success: true, payments });
  } catch (error) {
    console.error("Fetch payments error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payments." },
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

    const { invoiceId, paymentMethod, amount, transactionReference, notes } =
      await req.json();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found." },
        { status: 404 }
      );
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Valid positive payment amount required." },
        { status: 400 }
      );
    }

    const paymentNumber = `PAY-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Reconcile inside atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          paymentMethod: paymentMethod || "upi",
          amount: paymentAmount,
          transactionReference: transactionReference || null,
          notes: notes || "Payment recorded via Brightloop reconciliation ledger",
          recordedBy: user?.id || null,
        },
      });

      const newAmountPaid = invoice.amountPaid + paymentAmount;
      const newBalance = Math.max(0, invoice.totalAmount - newAmountPaid);
      const newStatus = newBalance <= 0 ? "paid" : "partially_paid";

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: newStatus,
        },
      });

      return { payment, invoice: updatedInvoice };
    });

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch (error) {
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: "Failed to record payment transaction." },
      { status: 500 }
    );
  }
}
