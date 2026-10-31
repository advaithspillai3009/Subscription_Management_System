import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePasswordPolicy, hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      fullName,
      companyName,
      phone,
      gstin,
    } = await req.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { error: "Email, password, full name, and company name are required." },
        { status: 400 }
      );
    }

    // 1. Password Policy Check
    const passwordCheck = validatePasswordPolicy(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }

    // 2. Email uniqueness check
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Create user and attached customer profile in atomic transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          fullName,
          role: "customer",
          isActive: true,
        },
      });

      const c = await tx.customer.create({
        data: {
          userId: u.id,
          companyName,
          contactName: fullName,
          email: normalizedEmail,
          phone: phone || null,
          gstin: gstin || null,
          status: "active",
        },
      });

      return { user: u, customer: c };
    });

    const sessionUser = {
      id: newUser.user.id,
      email: newUser.user.email,
      fullName: newUser.user.fullName,
      role: "customer" as const,
      customerId: newUser.customer.id,
    };

    const token = await createSessionToken(sessionUser);

    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json(
      { success: true, user: sessionUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
