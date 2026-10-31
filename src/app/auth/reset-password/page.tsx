"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const queryToken = searchParams.get("token");
    if (queryToken) {
      setToken(queryToken);
    }
  }, [searchParams]);

  // Live password complexity checks
  const hasMinLength = newPassword.length > 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasSpecial && isMatch;

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg("Password does not meet complexity requirements or confirmation does not match.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || "Password updated successfully!");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to reset password.");
      }
    } catch {
      setErrorMsg("Network connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-7 sm:p-9 shadow-none relative">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-[#0D530E] tracking-tight font-normal">
          Set new password
        </h2>
        <p className="text-xs text-[#0D530E]/65 mt-1">
          Establish an authorized enterprise password for your account
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

      {successMsg && (
        <div className="p-4 bg-[#E7E1B1] border border-[#C8D293] text-[#0D530E] text-xs rounded-xl space-y-1">
          <p className="font-semibold text-sm">✓ {successMsg}</p>
          <p className="text-[11px] text-[#0D530E]/75">Redirecting you to sign in...</p>
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleReset} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
              Reset Security Token
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token or loaded from URL"
              className="w-full text-xs font-mono border border-[#D8D1A4] bg-white/70 rounded-lg px-3 py-2 text-[#0D530E] placeholder:text-[#0D530E]/35 focus:outline-none focus:border-[#0D530E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-lg px-3 py-2 text-[#0D530E] placeholder:text-[#0D530E]/35 focus:outline-none focus:border-[#0D530E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-lg px-3 py-2 text-[#0D530E] placeholder:text-[#0D530E]/35 focus:outline-none focus:border-[#0D530E]"
            />
          </div>

          {/* Password Requirements Checklist */}
          <div className="bg-[#E7E1B1]/40 border border-[#D8D1A4] p-3 rounded-lg space-y-1 text-[11px] text-[#0D530E]/80">
            <span className="font-semibold block text-[10px] uppercase tracking-wider text-[#0D530E]">
              Policy Requirements:
            </span>
            <div className={`flex items-center space-x-1.5 ${hasMinLength ? "text-[#0D530E] font-medium" : "text-[#0D530E]/50"}`}>
              <span>{hasMinLength ? "✓" : "○"}</span>
              <span>9+ characters</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasUpper ? "text-[#0D530E] font-medium" : "text-[#0D530E]/50"}`}>
              <span>{hasUpper ? "✓" : "○"}</span>
              <span>1 uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasLower ? "text-[#0D530E] font-medium" : "text-[#0D530E]/50"}`}>
              <span>{hasLower ? "✓" : "○"}</span>
              <span>1 lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasSpecial ? "text-[#0D530E] font-medium" : "text-[#0D530E]/50"}`}>
              <span>{hasSpecial ? "✓" : "○"}</span>
              <span>1 special symbol (!@#$%...)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${isMatch ? "text-[#0D530E] font-medium" : "text-[#0D530E]/50"}`}>
              <span>{isMatch ? "✓" : "○"}</span>
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isPasswordValid}
            className="w-full mt-3 py-3 px-5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] font-medium text-sm rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 tracking-wide"
          >
            <span>{submitting ? "Updating..." : "Save New Password"}</span>
            <span>→</span>
          </button>
        </form>
      )}

      <div className="mt-5 pt-4 border-t border-[#D8D1A4]/60 text-center text-xs text-[#0D530E]/70">
        <Link href="/auth/login" className="text-[#0D530E] font-medium hover:underline">
          ← Back to Sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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
              Create New Password.<br />
              Strengthen Security.
            </h1>
            <p className="text-base sm:text-lg text-[#0D530E]/75 font-normal leading-relaxed max-w-md">
              Update your corporate login credentials. All active sessions will be re-authenticated with high-entropy cryptographic validation.
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

        {/* RIGHT COLUMN: Reset Form */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <React.Suspense fallback={<div className="text-sm text-[#0D530E]">Loading form...</div>}>
            <ResetPasswordForm />
          </React.Suspense>
        </div>

      </div>
    </div>
  );
}
