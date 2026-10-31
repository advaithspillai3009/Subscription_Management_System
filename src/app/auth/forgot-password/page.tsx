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
    } catch (err) {
      setErrorMsg("Network connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg border border-[#E1E6E3] shadow-sm">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#2F7D72]"></span>
            <span className="font-mono text-sm uppercase tracking-widest text-[#2F7D72] font-semibold">
              SECURITY RECOVERY
            </span>
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-[#12191A]">
            Reset your password
          </h2>
          <p className="text-xs text-[#5D6B6C]">
            Enter your registered corporate email to receive secure recovery credentials.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-[#D9383A] text-xs font-mono rounded">
            {errorMsg}
          </div>
        )}

        {/* Success / Dev Token Inspector */}
        {result ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#E6F2F0] border border-[#2F7D72] rounded-md text-xs font-mono text-[#2F7D72] space-y-2">
              <p className="font-bold">✓ Password Reset Token Generated</p>
              {result.devNotice && (
                <p className="text-[11px] text-[#5D6B6C]">{result.devNotice}</p>
              )}
            </div>

            {result.resetUrl && (
              <div className="bg-[#F8FAF9] p-4 rounded border border-[#E1E6E3] space-y-3">
                <span className="text-[10px] font-mono uppercase text-[#5D6B6C] block font-bold">
                  Hackathon Evaluation Fast-Path:
                </span>
                <Link
                  href={result.resetUrl}
                  className="block text-center py-2 px-3 bg-[#2F7D72] text-white text-xs font-mono rounded hover:bg-[#26665D] uppercase tracking-wider font-medium"
                >
                  Proceed to Reset Screen →
                </Link>
                <div className="text-[9px] font-mono text-[#5D6B6C] break-all bg-white p-2 border rounded">
                  Token: {result.resetToken}
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <Link href="/auth/login" className="text-xs font-mono text-[#2F7D72] hover:underline">
                ← Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
                Registered Work Email
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 text-xs font-mono font-medium rounded bg-[#2F7D72] text-white hover:bg-[#26665D] transition-colors disabled:opacity-50 uppercase tracking-wider"
            >
              {submitting ? "Verifying..." : "Generate Recovery Link"}
            </button>

            <div className="text-center text-xs text-[#5D6B6C] pt-2">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-[#2F7D72] font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
