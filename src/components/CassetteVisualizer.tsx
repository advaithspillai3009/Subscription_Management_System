"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";

export default function CassetteVisualizer({ mrrAmount = 4285000 }: { mrrAmount?: number }) {
  const [query, setQuery] = useState("Evaluate net retention risk across top 20 enterprise accounts");
  const [insightActive, setInsightActive] = useState<string | null>(null);

  const formattedMRR = `₹${(mrrAmount / 100000).toFixed(2)}L`;

  return (
    <div className="bg-[#FFFFFF] border border-[#E1E6E3] rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-card-subtle">
      {/* Header micro-labels identical to reference object frames */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-[#5D6B6C] border-b border-[#E1E6E3] pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-[#2F7D72] font-semibold">OBJECT NO. 001</span>
          <span className="text-[#DDE2DF]">·</span>
          <span>ORION RECURRING ENGINE v4.2</span>
        </div>
        <div className="text-[#5D6B6C]/80">少し懐かしく。</div>
      </div>

      {/* Visualizer Card: Crisp porcelain background with concentric orbit lines */}
      <div className="bg-[#F3F5F4] border border-[#E1E6E3] rounded-lg p-6 relative overflow-hidden mb-6 concentric-rings flex items-center justify-center">
        {/* Realistic Cassette Tape Graphic Visualizer */}
        <div className="w-full max-w-md aspect-[16/9.5] bg-[#1C2527] border-2 border-[#2C383B] rounded-xl p-4 shadow-cassette-depth relative flex flex-col justify-between transform hover:scale-[1.01] transition-transform">
          {/* Cassette Top Screws */}
          <div className="flex justify-between items-center px-1">
            <span className="w-2 h-2 rounded-full border border-[#3C4A4D] bg-[#111819] inline-block shadow-inner" />
            <span className="font-mono text-[9px] text-[#8A9B9E] tracking-widest uppercase font-medium">
              BRIGHTLOOP HIGH FIDELITY RECURRING AUDIO
            </span>
            <span className="w-2 h-2 rounded-full border border-[#3C4A4D] bg-[#111819] inline-block shadow-inner" />
          </div>

          {/* Cassette Main Label (Warm vintage cream label) */}
          <div className="cassette-label text-[#111819] rounded-lg p-3 mx-2 my-1 shadow relative overflow-hidden border border-[#D5D8CF]">
            {/* Tape colored accent stripes (Retro red & orange lines from Stitch design) */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="h-full w-1/2 bg-[#C9504E]" />
              <div className="h-full w-1/2 bg-[#DCA258]" />
            </div>

            <div className="flex justify-between items-start border-b border-[#111819]/15 pb-1 mb-2 pt-0.5">
              <div>
                <h4 className="font-bold text-xs tracking-wider uppercase text-[#111819]">
                  TOKYO AFTER HOURS // ORION BILLING
                </h4>
                <p className="text-[9px] text-[#5D6B6C] font-mono">
                  AUTOMATED EXPANSION ENGINE · SIDE A
                </p>
              </div>
              <span className="text-xl font-black font-mono tracking-tighter text-[#111819]">
                90
              </span>
            </div>

            {/* Cassette Windows & Rotating Spools */}
            <div className="bg-[#111819] rounded-md p-2 flex items-center justify-around border border-[#2D393C]">
              {/* Left Spool */}
              <div
                className="w-9 h-9 rounded-full border-2 border-dashed border-[#2F7D72] flex items-center justify-center animate-spin"
                style={{ animationDuration: "9s" }}
              >
                <div className="w-4 h-4 rounded-full bg-[#1C2527] border border-[#3C4A4D] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2F7D72]" />
                </div>
              </div>

              {/* Magnetic Tape Window with Live Numbers */}
              <div className="bg-[#182123] border border-[#2D393C] px-4 py-1 rounded text-center">
                <div className="text-[8px] font-mono text-[#2F7D72] font-semibold tracking-wider">
                  MRR PACING
                </div>
                <div className="text-xs font-mono font-bold text-[#FFFFFF]">
                  ₹{mrrAmount.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Right Spool */}
              <div
                className="w-9 h-9 rounded-full border-2 border-dashed border-[#2F7D72] flex items-center justify-center animate-spin"
                style={{ animationDuration: "9s" }}
              >
                <div className="w-4 h-4 rounded-full bg-[#1C2527] border border-[#3C4A4D] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2F7D72]" />
                </div>
              </div>
            </div>

            {/* Striped Decal Footer */}
            <div className="flex justify-between items-center text-[9px] font-mono mt-2 pt-1 border-t border-[#111819]/15 text-[#5D6B6C]">
              <span className="tracking-widest font-medium">シティー・ポップ</span>
              <span className="font-bold text-[#111819]">STEREO / SIDE A</span>
            </div>
          </div>

          {/* Cassette Bottom Screws */}
          <div className="flex justify-between items-center px-1">
            <span className="w-2 h-2 rounded-full border border-[#3C4A4D] bg-[#111819] inline-block shadow-inner" />
            <span className="text-[9px] font-mono text-[#8A9B9E]">35°40' N   139°45' E</span>
            <span className="w-2 h-2 rounded-full border border-[#3C4A4D] bg-[#111819] inline-block shadow-inner" />
          </div>
        </div>
      </div>

      {/* Interactive ORION Intelligence Assistant Query & Live Insights */}
      <div className="space-y-3">
        {/* Natural Language Prompt Input Bar */}
        <div className="relative">
          <input
            className="w-full bg-[#FFFFFF] border border-[#E1E6E3] text-xs text-[#111819] placeholder-[#5D6B6C]/60 rounded-lg pl-3.5 pr-28 py-3 focus:outline-none focus:border-[#2F7D72] focus:ring-1 focus:ring-[#2F7D72] transition-colors shadow-2xs font-mono"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask ORION about churn, expansion MRR, or overdue INR collections..."
            type="text"
            value={query}
          />
          <button
            className="absolute right-2 top-2 px-3 py-1 bg-[#12191A] hover:bg-[#2F7D72] text-[#FFFFFF] text-xs font-mono font-medium rounded transition-colors shadow-xs flex items-center space-x-1"
            onClick={() => setInsightActive("Analyzing enterprise cohort churn vectors across India accounts...")}
            type="button"
          >
            <span>EXECUTE</span>
            <span>↵</span>
          </button>
        </div>

        {/* Dynamic Proactive AI Insight Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div
            className="p-3 bg-[#FFFFFF] border border-[#E1E6E3] rounded-lg hover:border-[#2F7D72] transition-all cursor-pointer group shadow-2xs"
            onClick={() => setQuery("Show 12 accounts renewing in 14 days")}
          >
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#2F7D72] mb-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D72]" />
              <span>RENEWAL PREDICTION</span>
            </div>
            <p className="text-xs text-[#111819] leading-snug">
              ₹18.5L across 12 Enterprise accounts renewing in 14 days. Probability: 96.4%.
            </p>
          </div>

          <div
            className="p-3 bg-[#FFFFFF] border border-[#E1E6E3] rounded-lg hover:border-[#D95C68] transition-all cursor-pointer group shadow-2xs"
            onClick={() => setQuery("Inspect Razorpay webhook timeout on Indus FinTech")}
          >
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#D95C68] mb-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D95C68]" />
              <span>UNUSUAL PAYMENT TIMEOUT</span>
            </div>
            <p className="text-xs text-[#111819] leading-snug">
              Razorpay webhook timeout on BL-9842 (₹1,45,000). Automated UPI retry queued.
            </p>
          </div>

          <div
            className="p-3 bg-[#FFFFFF] border border-[#E1E6E3] rounded-lg hover:border-[#2F7D72] transition-all cursor-pointer group shadow-2xs"
            onClick={() => setQuery("Review CloudScale Technologies upgrade recommendation")}
          >
            <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#2F7D72] mb-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D72]" />
              <span>EXPANSION OPPORTUNITY</span>
            </div>
            <p className="text-xs text-[#111819] leading-snug">
              CloudScale Tech at 92% quota. Recommend Scale tier upgrade (+₹85,000/mo).
            </p>
          </div>
        </div>

        {insightActive && (
          <div className="p-3 bg-[#F3F5F4] border border-[#2F7D72]/40 rounded-lg text-xs font-mono text-[#111819] flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2F7D72] animate-spin" />
              <span>{insightActive}</span>
            </span>
            <button
              className="text-[10px] uppercase text-[#5D6B6C] hover:text-[#111819]"
              onClick={() => setInsightActive(null)}
              type="button"
            >
              [Dismiss]
            </button>
          </div>
        )}

        {/* Sub micro-footer in right card (matching Stitch footer text) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#5D6B6C] pt-2 border-t border-[#E1E6E3]">
          <span>A little analog in a digital world.</span>
          <span className="text-right tracking-tight font-medium">
            HOVER TO EXPLORE · CLICK TO ROTATE METRICS
          </span>
        </div>
      </div>
    </div>
  );
}
