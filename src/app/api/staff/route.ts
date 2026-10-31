import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole, hashPassword, validatePasswordPolicy } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user && !requireRole(user, ["admin"])) {
      return NextResponse.json({ error: "Access restricted to administrators." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Fetch staff error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user accounts." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (user && !requireRole(user, ["admin"])) {
      return NextResponse.json({ error: "Access restricted to administrators." }, { status: 403 });
    }

    const { email, password, fullName, role } = await req.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Email, password, full name, and role are required." },
        { status: 400 }
      );
    }

    if (!["admin", "staff", "customer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }

    const policy = validatePasswordPolicy(password);
    if (!policy.isValid) {
      return NextResponse.json(
        { error: `Password policy failed: ${policy.errors.join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName,
        role,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { error: "Failed to create user account." },
      { status: 500 }
    );
  }
}
