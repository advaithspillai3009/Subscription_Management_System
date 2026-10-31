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
    } catch (err) {
      setErrorMsg("Network connection error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg border border-[#E1E6E3] shadow-sm">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#2F7D72]"></span>
          <span className="font-mono text-sm uppercase tracking-widest text-[#2F7D72] font-semibold">
            CREDENTIAL RESET
          </span>
        </div>
        <h2 className="text-2xl font-bold font-mono tracking-tight text-[#12191A]">
          Set new password
        </h2>
        <p className="text-xs text-[#5D6B6C]">
          Establish a strong, compliant enterprise password for your account.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#D9383A] text-xs font-mono rounded">
          {errorMsg}
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 bg-[#E6F2F0] border border-[#2F7D72] text-[#2F7D72] text-xs font-mono rounded space-y-2">
          <p className="font-bold">✓ {successMsg}</p>
          <p className="text-[11px] text-[#5D6B6C]">Redirecting you to login screen...</p>
        </div>
      )}

      {!successMsg && (
        <form onSubmit={handleReset} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              Reset Security Token *
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste token or loaded from URL"
              className="w-full font-mono text-xs border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              New Password *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-[#5D6B6C] uppercase mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
            />
          </div>

          {/* Password Requirements Checklist */}
          <div className="bg-[#F8FAF9] p-3 rounded border border-[#E1E6E3] space-y-1 font-mono text-[10px]">
            <span className="text-[#5D6B6C] uppercase tracking-wider block font-bold mb-1">
              Policy Compliance:
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
            <div className={`flex items-center space-x-1.5 ${isMatch ? "text-[#2E8540]" : "text-[#5D6B6C]"}`}>
              <span>{isMatch ? "✓" : "○"}</span>
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isPasswordValid}
            className="w-full py-2.5 px-4 text-xs font-mono font-medium rounded bg-[#2F7D72] text-white hover:bg-[#26665D] transition-colors disabled:opacity-50 uppercase tracking-wider"
          >
            {submitting ? "Updating..." : "Confirm & Save Password"}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-[#5D6B6C]">
        <Link href="/auth/login" className="text-[#2F7D72] font-semibold hover:underline">
          ← Back to Sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <React.Suspense fallback={<div className="font-mono text-xs">Loading form...</div>}>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  );
}
