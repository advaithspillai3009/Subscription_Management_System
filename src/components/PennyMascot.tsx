"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X, ChevronRight, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

export type PennyMood = "IDLE_CHEERFUL" | "ALERT_WARNING" | "CELEBRATION" | "THINKING" | "EDUCATIONAL";

export default function PennyMascot({
  initialMood = "IDLE_CHEERFUL",
  customMessage,
}: {
  initialMood?: PennyMood;
  customMessage?: string;
}) {
  const [mood, setMood] = useState<PennyMood>(initialMood);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (initialMood) {
      setMood(initialMood);
    }
  }, [initialMood]);

  // Contextual messages based on mood
  const getDialogue = () => {
    if (customMessage) return customMessage;
    switch (mood) {
      case "ALERT_WARNING":
        return "Watch out! Indus FinTech (₹1,45,000) is 3 days past due on payment terms. Automated UPI retry is queued.";
      case "CELEBRATION":
        return "Splendid! Batch billing run complete. All invoices generated with zero duplicates and accurate GST 18%.";
      case "THINKING":
        return "Evaluating 12-month recurring compound trajectory across top enterprise accounts...";
      case "EDUCATIONAL":
        return "Tip: Adding the Odoo Brand variant adds exactly ₹560 directly to the plan's base selling price.";
      case "IDLE_CHEERFUL":
      default:
        return "All systems optimal. Contracted MRR is pacing at ₹42.85 Lakhs with 99.1% net retention.";
    }
  };

  if (isMinimized) {
    return (
      <button
        className="fixed bottom-6 right-6 z-50 p-2.5 rounded-full bg-[#FFA53B] text-[#12191A] shadow-lg border-2 border-white hover:scale-110 transition-transform flex items-center justify-center font-bold font-mono text-xs"
        onClick={() => setIsMinimized(false)}
        title="Open Penny Financial Assistant"
        type="button"
      >
        🪙
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto">
      {/* Speech Bubble / Advice Panel */}
      {isExpanded && (
        <div className="mb-3 w-80 sm:w-96 bg-white border border-[#E1E6E3] rounded-2xl shadow-xl p-4 relative animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#E1E6E3] pb-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#FFA53B]" />
              <span className="font-display font-bold text-xs text-[#111819]">
                PENNY // FINANCIAL TELEMETRY
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="text-xs text-[#5D6B6C] hover:text-[#111819] p-1"
                onClick={() => setIsMinimized(true)}
                title="Minimize Penny"
                type="button"
              >
                _
              </button>
              <button
                className="text-xs text-[#5D6B6C] hover:text-[#111819] p-1"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-[#111819] leading-relaxed mb-3 font-sans">
            {getDialogue()}
          </p>

          {/* Quick Contextual Triggers */}
          <div className="space-y-1.5 pt-1 border-t border-[#E1E6E3]">
            <button
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#F8FAF9] hover:bg-[#F3F5F4] text-[11px] font-mono text-[#2F7D72] flex items-center justify-between transition-colors"
              onClick={() => {
                setMood("ALERT_WARNING");
              }}
              type="button"
            >
              <span>Scan Overdue Balances</span>
              <ChevronRight className="w-3 h-3 text-[#5D6B6C]" />
            </button>
            <button
              className="w-full text-left px-2.5 py-1.5 rounded bg-[#F8FAF9] hover:bg-[#F3F5F4] text-[11px] font-mono text-[#111819] flex items-center justify-between transition-colors"
              onClick={() => {
                setMood("EDUCATIONAL");
              }}
              type="button"
            >
              <span>Explain Odoo +₹560 Variant Rule</span>
              <ChevronRight className="w-3 h-3 text-[#5D6B6C]" />
            </button>
          </div>
        </div>
      )}

      {/* The Animated Orange Coin Mascot (Penny) */}
      <div
        className="group flex items-center space-x-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {!isExpanded && (
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/95 border border-[#E1E6E3] shadow-sm text-xs font-mono text-[#111819] hover:border-[#FFA53B] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFA53B] animate-ping" />
            <span>Penny: Ask me anything</span>
          </div>
        )}

        {/* Mascot Avatar Widget */}
        <div
          className={`w-14 h-14 rounded-full bg-gradient-to-br from-[#FFB852] to-[#F28D1A] p-0.5 shadow-lg border-2 border-white transition-all transform hover:scale-105 ${mood === "ALERT_WARNING"
            ? "ring-4 ring-amber-400 animate-pulse"
            : mood === "CELEBRATION"
              ? "ring-4 ring-emerald-400"
              : ""
            }`}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FFA53B] to-[#FFBF66] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Coin Rim Detail */}
            <div className="absolute inset-0.5 rounded-full border border-white/40 pointer-events-none" />

            {/* Mascot Facial Expression */}
            <div className="flex items-center space-x-2 z-10">
              {mood === "ALERT_WARNING" ? (
                <>
                  <div className="w-2 h-2.5 rounded-full bg-[#12191A]" />
                  <div className="w-2 h-2.5 rounded-full bg-[#12191A]" />
                </>
              ) : mood === "THINKING" ? (
                <>
                  <div className="w-2 h-1 rounded-full bg-[#12191A]" />
                  <div className="w-2 h-2.5 rounded-full bg-[#12191A]" />
                </>
              ) : (
                <>
                  <div className="w-1.5 h-2 rounded-full bg-[#12191A]" />
                  <div className="w-1.5 h-2 rounded-full bg-[#12191A]" />
                </>
              )}
            </div>

            {/* Mascot Mouth */}
            <div className="mt-0.5 z-10">
              {mood === "ALERT_WARNING" ? (
                <div className="w-2.5 h-2 rounded-full border-b-2 border-black" />
              ) : mood === "CELEBRATION" ? (
                <div className="w-3.5 h-2 bg-[#12191A] rounded-b-full" />
              ) : (
                <div className="w-3 h-1.5 border-b-2 border-[#12191A] rounded-b-md" />
              )}
            </div>

            {/* Coin Currency Symbol Watermark */}
            <span className="absolute bottom-1 font-mono font-black text-[9px] text-[#12191A]/30">
              ₹
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

