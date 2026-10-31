import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status && status !== "all") {
      whereClause.status = status;
    }
    if (search) {
      whereClause.OR = [
        { companyName: { contains: search } },
        { contactName: { contains: search } },
        { email: { contains: search } },
        { billingCity: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        subscriptions: true,
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve customers." },
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

    const body = await req.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      gstin,
      billingCity,
      billingStreet,
      billingState,
      billingPostalCode,
    } = body;

    const customer = await prisma.customer.create({
      data: {
        companyName,
        contactName,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        gstin: gstin || null,
        billingCity: billingCity || null,
        billingStreet: billingStreet || null,
        billingState: billingState || null,
        billingPostalCode: billingPostalCode || null,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, customer }, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { error: "Failed to create customer." },
      { status: 500 }
    );
  }
}
