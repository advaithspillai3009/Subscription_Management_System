"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live password complexity checks
  const hasMinLength = password.length > 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg("Please ensure password satisfies all security requirements.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          companyName,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/portal");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Registration failed.");
      }
    } catch (err) {
      setErrorMsg("Network connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg border border-[#E1E6E3] shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#2F7D72]"></span>
            <span className="font-mono text-sm uppercase tracking-widest text-[#2F7D72] font-semibold">
              BRIGHTLOOP ONBOARDING
            </span>
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-[#12191A]">
            Create customer account
          </h2>
          <p className="text-xs text-[#5D6B6C]">
            Register your company to access your self-service subscription and invoicing portal.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#D9383A] text-xs font-mono rounded">
            {errorMsg}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
              className="w-full border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              Enterprise / Company Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Apex Cloud Systems Ltd"
              className="w-full border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              Corporate Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              Secure Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          {/* Password Requirements Checklist */}
          <div className="bg-[#F8FAF9] p-3 rounded border border-[#E1E6E3] space-y-1 font-mono text-[10px]">
            <span className="text-[#5D6B6C] uppercase tracking-wider block font-bold mb-1">
              Security Policy Checklist:
            </span>
            <div className={`flex items-center space-x-1.5 ${hasMinLength ? "text-[#2E8540]" : "text-[#5D6B6C]"}`}>
              <span>{hasMinLength ? "✓" : "○"}</span>
              <span>More than 8 characters (at least 9)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasUpper ? "text-[#2E8540]" : "text-[#5D6B6C]"}`}>
              <span>{hasUpper ? "✓" : "○"}</span>
              <span>At least 1 uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasLower ? "text-[#2E8540]" : "text-[#5D6B6C]"}`}>
              <span>{hasLower ? "✓" : "○"}</span>
              <span>At least 1 lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasSpecial ? "text-[#2E8540]" : "text-[#5D6B6C]"}`}>
              <span>{hasSpecial ? "✓" : "○"}</span>
              <span>At least 1 special character (!@#$%^&*...)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isPasswordValid}
            className="w-full py-2.5 px-4 text-xs font-mono font-medium rounded bg-[#2F7D72] text-white hover:bg-[#26665D] transition-colors disabled:opacity-50 uppercase tracking-wider"
          >
            {submitting ? "Deploying Account..." : "Register Customer Account"}
          </button>
        </form>

        <div className="text-center text-xs text-[#5D6B6C]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#2F7D72] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
