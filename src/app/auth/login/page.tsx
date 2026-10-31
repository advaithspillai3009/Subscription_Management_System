"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        setErrorMsg(data.error || "Authentication failed.");
      }
    } catch (err) {
      setErrorMsg("Network connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg border border-[#E1E6E3] shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#2F7D72]"></span>
            <span className="font-mono text-sm uppercase tracking-widest text-[#2F7D72] font-semibold">
              BRIGHTLOOP TELEMETRY
            </span>
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-[#12191A]">
            Sign in to your account
          </h2>
          <p className="text-xs text-[#5D6B6C]">
            Access your B2B subscription and financial billing control console.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#D9383A] text-xs font-mono rounded">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brightloop.io"
              className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[10px] font-mono text-[#2F7D72] hover:underline"
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
              className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 text-xs font-mono font-medium rounded bg-[#2F7D72] text-white hover:bg-[#26665D] transition-colors disabled:opacity-50 uppercase tracking-wider"
          >
            {submitting ? "Verifying..." : "Authorize & Sign In"}
          </button>
        </form>

        {/* Quick-Fill Evaluator / Judge Credentials */}
        <div className="border-t border-[#E1E6E3] pt-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-[#5D6B6C] block text-center">
            Hackathon Evaluator Quick-Fill Credentials:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo("admin@brightloop.io", "Admin@12345!")}
              className="px-2 py-1.5 text-[10px] font-mono bg-[#F8FAF9] hover:bg-[#E6F2F0] hover:text-[#2F7D72] border border-[#E1E6E3] rounded text-center transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo("staff@brightloop.io", "Staff@12345!")}
              className="px-2 py-1.5 text-[10px] font-mono bg-[#F8FAF9] hover:bg-[#E6F2F0] hover:text-[#2F7D72] border border-[#E1E6E3] rounded text-center transition-colors"
            >
              🛠️ Staff
            </button>
            <button
              type="button"
              onClick={() => fillDemo("billing@razorpay.com", "Customer@12345!")}
              className="px-2 py-1.5 text-[10px] font-mono bg-[#F8FAF9] hover:bg-[#E6F2F0] hover:text-[#2F7D72] border border-[#E1E6E3] rounded text-center transition-colors"
            >
              🏢 Customer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-[#5D6B6C]">
          Don't have an enterprise account?{" "}
          <Link href="/auth/register" className="text-[#2F7D72] font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
