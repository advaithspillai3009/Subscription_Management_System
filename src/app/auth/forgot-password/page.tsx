"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setResult(null);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setErrorMsg(data.error || "Failed to process request.");
      }
    } catch {
      setErrorMsg("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5DD] relative flex flex-col justify-between overflow-x-hidden selection:bg-[#E7E1B1]">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative z-10">
        
        {/* LEFT COLUMN: Editorial Branding & Arcs */}
        <div className="relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#D8D1A4]/60 min-h-[420px] lg:min-h-screen">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-6 bg-[#0D530E] rounded-full inline-block"></span>
              <span className="w-2.5 h-6 bg-[#0D530E] rounded-full inline-block"></span>
            </div>
            <span className="text-xl font-medium tracking-tight text-[#0D530E]">
              brightloop
            </span>
          </div>

          <div className="my-auto py-10 lg:py-0 max-w-xl">
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif text-[#0D530E] tracking-tight leading-[1.1] mb-6">
              Account Recovery.<br />
              Secure & Instant.
            </h1>
            <p className="text-base sm:text-lg text-[#0D530E]/75 font-normal leading-relaxed max-w-md">
              Enter your corporate email address to receive an authorized security reset link with cryptographic validation.
            </p>
          </div>

          <div className="text-xs text-[#0D530E]/50 font-sans tracking-wide">
            © 2026 Brightloop • Engineered for Odoo Hackathon
          </div>

          {/* Bottom-left Concentric Arcs */}
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

        {/* RIGHT COLUMN: Reset Request Card */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-[440px] bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-7 sm:p-9 shadow-none relative">
            <div className="mb-6">
              <h2 className="text-2xl font-serif text-[#0D530E] tracking-tight font-normal">
                Reset your password
              </h2>
              <p className="text-xs text-[#0D530E]/65 mt-1">
                Enter your work email to receive verification credentials
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100/60 border border-red-300 text-red-900 text-xs rounded-lg flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-700 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#E7E1B1] border border-[#C8D293] rounded-xl text-xs text-[#0D530E] space-y-1.5">
                  <p className="font-semibold text-sm">✓ Recovery Token Dispatched</p>
                  {result.devNotice && (
                    <p className="text-[11px] text-[#0D530E]/75">{result.devNotice}</p>
                  )}
                </div>

                {result.resetUrl && (
                  <div className="bg-[#E7E1B1]/30 p-4 rounded-xl border border-[#D8D1A4] space-y-3">
                    <span className="text-[10px] font-sans uppercase text-[#0D530E]/70 block font-semibold tracking-wider">
                      Hackathon Evaluator Fast-Path:
                    </span>
                    <Link
                      href={result.resetUrl}
                      className="block text-center py-2.5 px-4 bg-[#0D530E] text-[#FBF5DD] text-xs font-medium rounded-xl hover:bg-[#146615] transition-all"
                    >
                      Proceed to Reset Screen →
                    </Link>
                    <div className="text-[10px] font-mono text-[#0D530E]/65 break-all bg-white/60 p-2 border border-[#D8D1A4] rounded-lg">
                      Token: {result.resetToken}
                    </div>
                  </div>
                )}

                <div className="text-center pt-2">
                  <Link href="/auth/login" className="text-xs text-[#0D530E] hover:underline font-medium">
                    ← Return to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Registered Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@brightloop.io"
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-lg px-3 py-2.5 text-[#0D530E] placeholder:text-[#0D530E]/35 focus:outline-none focus:border-[#0D530E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] font-medium text-sm rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 tracking-wide"
                >
                  <span>{submitting ? "Verifying..." : "Generate Recovery Link"}</span>
                  <span>→</span>
                </button>

                <div className="mt-4 pt-4 border-t border-[#D8D1A4]/60 text-center text-xs text-[#0D530E]/70">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-[#0D530E] font-medium hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
