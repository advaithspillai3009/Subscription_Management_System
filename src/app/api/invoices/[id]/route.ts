import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();

    const invoice = await prisma.invoice.findUnique({
      where: { id },
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
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    if (
      user &&
      user.role === "customer" &&
      user.customerId !== invoice.customerId
    ) {
      return NextResponse.json(
        { error: "Access denied to other tenant invoice." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error("Fetch invoice detail error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve invoice." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await req.json();
    const { id } = params;
    const user = await getCurrentUser();

    if (user && !requireRole(user, ["admin", "staff"])) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    let updatedStatus = "confirmed";
    if (action === "cancel") {
      updatedStatus = "cancelled";
    } else if (action === "confirm") {
      updatedStatus = "confirmed";
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: updatedStatus },
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Update invoice error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice." },
      { status: 500 }
    );
  }
}
