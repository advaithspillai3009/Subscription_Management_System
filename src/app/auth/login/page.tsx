"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RoleType = "admin" | "staff" | "customer";

interface RoleOption {
  id: RoleType;
  title: string;
  subtitle: string;
  defaultEmail: string;
  defaultPass: string;
  icon: (active: boolean) => React.ReactNode;
}

const ROLES: RoleOption[] = [
  {
    id: "admin",
    title: "Admin",
    subtitle: "Full access to the system",
    defaultEmail: "admin@brightloop.io",
    defaultPass: "Admin@12345!",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#0D530E]" : "text-[#0D530E]/70"}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.88-3.86-1.1-7-5.34-7-9.88V6.3l7-3.12zM12 6a4 4 0 00-4 4c0 1.93 1.37 3.54 3.2 3.92V17h1.6v-3.08c1.83-.38 3.2-1.99 3.2-3.92a4 4 0 00-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
      </svg>
    ),
  },
  {
    id: "staff",
    title: "Staff",
    subtitle: "Manage day-to-day operations",
    defaultEmail: "staff@brightloop.io",
    defaultPass: "Staff@12345!",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#0D530E]" : "text-[#0D530E]/70"}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    id: "customer",
    title: "Customer",
    subtitle: "View and manage your subscriptions",
    defaultEmail: "billing@razorpay.com",
    defaultPass: "Customer@12345!",
    icon: (active: boolean) => (
      <svg
        className={`w-5 h-5 ${active ? "text-[#0D530E]" : "text-[#0D530E]/70"}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>("admin");
  const [email, setEmail] = useState("admin@brightloop.io");
  const [password, setPassword] = useState("Admin@12345!");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRoleSelect = (roleId: RoleType) => {
    setSelectedRole(roleId);
    const targetRole = ROLES.find((r) => r.id === roleId);
    if (targetRole) {
      setEmail(targetRole.defaultEmail);
      setPassword(targetRole.defaultPass);
    }
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.user?.role === "customer") {
          router.push("/portal");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        setErrorMsg(data.error || "Authentication failed. Please verify credentials.");
      }
    } catch {
      setErrorMsg("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5DD] relative flex flex-col justify-between overflow-x-hidden selection:bg-[#E7E1B1]">
      {/* Main Grid: 2 Columns with thin vertical divider matching Reference B */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* LEFT COLUMN: Editorial Branding & Headline */}
        <div className="relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#D8D1A4]/60 min-h-[480px] lg:min-h-screen">
          
          {/* Top Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-6 bg-[#0D530E] rounded-full inline-block"></span>
              <span className="w-2.5 h-6 bg-[#0D530E] rounded-full inline-block"></span>
            </div>
            <span className="text-xl font-medium tracking-tight text-[#0D530E]">
              brightloop
            </span>
          </div>

          {/* Center / Primary Headline */}
          <div className="my-auto py-12 lg:py-0 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif text-[#0D530E] tracking-tight leading-[1.08] mb-6">
              Manage Subscriptions.<br />
              Grow Effortlessly.
            </h1>
            <p className="text-base sm:text-lg text-[#0D530E]/75 font-normal leading-relaxed max-w-md">
              A complete subscription management system for your business.
            </p>
          </div>

          {/* Bottom Footer note / Hackathon notice */}
          <div className="text-xs text-[#0D530E]/50 font-sans tracking-wide">
            © 2026 Brightloop • Engineered for Odoo Hackathon
          </div>

          {/* Bottom-left Concentric Geometric Arcs (Pixel-matching Reference B) */}
          <div className="absolute bottom-0 left-0 w-80 h-80 sm:w-96 sm:h-96 pointer-events-none overflow-hidden select-none z-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 380 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="0" cy="380" r="360" fill="#F3ECCA" fillOpacity="0.4" />
              <circle cx="0" cy="380" r="285" fill="#DEE4A7" fillOpacity="0.6" />
              <circle cx="0" cy="380" r="210" fill="#55883B" fillOpacity="0.75" />
              <circle cx="0" cy="380" r="135" fill="#0D530E" />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Role-Selection & Explicit Credentials Form matching Reference B */}
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[440px] bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-7 sm:p-9 shadow-none relative">
            
            {/* Centered Brand Mark inside card */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="flex items-center space-x-1.5 mb-2">
                <span className="w-2.5 h-6 bg-[#0D530E] rounded-full inline-block"></span>
                <span className="w-2.5 h-6 bg-[#0D530E] rounded-full inline-block"></span>
              </div>
              <span className="text-xl font-medium tracking-tight text-[#0D530E] mb-3">
                brightloop
              </span>
              <h2 className="text-2xl font-serif text-[#0D530E] tracking-tight font-normal">
                Welcome back!
              </h2>
              <p className="text-xs text-[#0D530E]/65 mt-1">
                Choose your role to continue
              </p>
            </div>

            {/* Error Message if any */}
            {errorMsg && (
              <div className="mb-5 p-3 bg-red-100/60 border border-red-300 text-red-900 text-xs rounded-lg flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* 3 Role Selection Cards from Reference B */}
              <div className="space-y-2">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? "bg-[#E7E1B1] border-[#C8D293] shadow-sm"
                          : "bg-transparent border-[#D8D1A4] hover:bg-[#F3ECCA]/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="shrink-0 p-1">
                          {role.icon(isSelected)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#0D530E] leading-tight">
                            {role.title}
                          </div>
                          <div className="text-[11px] text-[#0D530E]/65 mt-0.5 leading-tight">
                            {role.subtitle}
                          </div>
                        </div>
                      </div>

                      {/* Circular Radio Indicator */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-[#0D530E] bg-transparent"
                            : "border-[#0D530E]/30 bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#0D530E]"></span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explicit Email and Password Fields */}
              <div className="pt-2 border-t border-[#D8D1A4]/60 space-y-3">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] placeholder:text-[#0D530E]/35 focus:outline-none focus:border-[#0D530E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70">
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-[10px] text-[#0D530E]/60 hover:text-[#0D530E] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] placeholder:text-[#0D530E]/35 focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              {/* Continue → Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-3 px-5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] font-medium text-sm rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 tracking-wide"
              >
                <span>{submitting ? "Signing in..." : "Continue"}</span>
                <span className="text-base leading-none">→</span>
              </button>
            </form>

            {/* Registration link */}
            <div className="mt-5 pt-4 border-t border-[#D8D1A4]/60 text-center text-xs text-[#0D530E]/70">
              Need a corporate account?{" "}
              <Link
                href="/auth/register"
                className="hover:text-[#0D530E] font-medium hover:underline transition-colors"
              >
                Register company →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
