"use client";

import React, { useState } from "react";
import { CheckCircle2, Shield, Settings2, Sliders } from "lucide-react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Brightloop Technologies Ltd.");
  const [gstin, setGstin] = useState("29AAAAA0000A1Z5");
  const [currency, setCurrency] = useState("INR");
  const [autoDunning, setAutoDunning] = useState(true);
  const [gracePeriodDays, setGracePeriodDays] = useState(7);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Toast Feedback */}
      {savedFeedback && (
        <div className="bg-[#E7E1B1] border border-[#C8D293] p-4 rounded-xl flex items-center justify-between text-xs text-[#0D530E]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#306D29]" />
            <span className="font-medium">System configuration settings saved successfully!</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#0D530E] tracking-tight font-normal">
          System & Billing Settings
        </h1>
        <p className="text-sm text-[#0D530E]/70 mt-1">
          Configure corporate entity details, automated dunning protocols, GST taxation rules, and invoice notification schedules.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Profile Card */}
        <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
          <div className="bg-[#E7E1B1] px-6 py-4 border-b border-[#D8D1A4]">
            <h2 className="font-serif text-lg text-[#0D530E] font-normal">
              Corporate Entity & GST Profile
            </h2>
            <p className="text-xs text-[#0D530E]/70 mt-0.5">
              Appears on all generated tax invoices and commercial proposals
            </p>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Company Legal Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Corporate GSTIN (15 Digits)
                </label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full text-xs font-mono border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Default Settlement Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  <option value="INR">Indian Rupee (INR ₹)</option>
                  <option value="USD">US Dollar (USD $)</option>
                  <option value="EUR">Euro (EUR €)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Tax Schedule
                </label>
                <div className="p-2.5 bg-[#E7E1B1]/30 border border-[#D8D1A4] rounded-xl text-xs text-[#0D530E] font-medium">
                  Dual GST (9% CGST + 9% SGST = 18% Integrated)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automated Dunning & Collections Rules */}
        <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
          <div className="bg-[#E7E1B1] px-6 py-4 border-b border-[#D8D1A4]">
            <h2 className="font-serif text-lg text-[#0D530E] font-normal">
              Automated Dunning & Billing Policies
            </h2>
            <p className="text-xs text-[#0D530E]/70 mt-0.5">
              Protocol rules for overdue invoices and subscription grace periods
            </p>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-[#E7E1B1]/30 border border-[#D8D1A4] rounded-xl">
              <div>
                <div className="font-medium text-[#0D530E]">Automated Grace Period Protocol</div>
                <div className="text-[11px] text-[#0D530E]/65 mt-0.5">
                  Allows customers to continue service during overdue settlement review
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoDunning}
                onChange={(e) => setAutoDunning(e.target.checked)}
                className="w-4 h-4 accent-[#0D530E] rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                Grace Period Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 7)}
                className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-[#E7E1B1]/30 border border-[#D8D1A4] rounded-xl">
              <div>
                <div className="font-medium text-[#0D530E]">Daily Invoice & Billing Summary Emails</div>
                <div className="text-[11px] text-[#0D530E]/65 mt-0.5">
                  Send automated midnight telemetry reports to financial controllers
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#0D530E] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl text-xs font-medium transition-all tracking-wide"
          >
            Save Configuration Changes →
          </button>
        </div>
      </form>
    </div>
  );
}

