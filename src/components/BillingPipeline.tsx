"use client";

import React, { useState } from "react";
import { Play, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, FileText } from "lucide-react";

export interface PipelineCard {
  id: string;
  subNumber: string;
  companyName: string;
  planName: string;
  amount: number;
  stage: "due" | "generated" | "awaiting" | "settled" | "dunning";
}

export default function BillingPipeline() {
  const [loading, setLoading] = useState(false);
  const [billingResult, setBillingResult] = useState<{
    processed: number;
    generated: number;
    skipped: number;
    amount: number;
  } | null>(null);

  const [cards, setCards] = useState<PipelineCard[]>([
    {
      id: "1",
      subNumber: "SUB-9821",
      companyName: "Razorpay Integration Ltd",
      planName: "Enterprise Custom",
      amount: 283200,
      stage: "settled",
    },
    {
      id: "2",
      subNumber: "SUB-9822",
      companyName: "Zenith Logistics Tech",
      planName: "Scale Automation",
      amount: 100300,
      stage: "awaiting",
    },
    {
      id: "3",
      subNumber: "SUB-9823",
      companyName: "Indus FinTech Labs",
      planName: "Enterprise Custom",
      amount: 171100,
      stage: "dunning",
    },
    {
      id: "4",
      subNumber: "SUB-9824",
      companyName: "HyperLocal Commerce",
      planName: "Growth Tier",
      amount: 21240,
      stage: "due",
    },
    {
      id: "5",
      subNumber: "SUB-9825",
      companyName: "CloudScale Technologies",
      planName: "Growth Tier",
      amount: 26550,
      stage: "due",
    },
  ]);

  const handleRunBatchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/run", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setBillingResult({
          processed: data.result.processedCount,
          generated: data.result.generatedCount,
          skipped: data.result.skippedDuplicateCount,
          amount: data.result.totalBilledAmount,
        });

        // Move due cards to generated/awaiting
        setCards((prev) =>
          prev.map((c) =>
            c.stage === "due" ? { ...c, stage: "generated" } : c
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStageCards = (stage: PipelineCard["stage"]) =>
    cards.filter((c) => c.stage === stage);

  return (
    <div className="bg-white border border-[#E1E6E3] rounded-xl p-6 shadow-card-subtle">
      {/* Header & Batch Execution Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E6E3] pb-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#2F7D72] mb-1 font-semibold">
            <span className="w-1.5 h-1.5 bg-[#2F7D72] rounded-full" />
            <span>AUTOMATED BILLING CONTROL CENTER</span>
          </div>
          <h3 className="text-xl font-bold text-[#111819]">Visual Billing Execution Pipeline</h3>
          <p className="text-xs text-[#5D6B6C] mt-0.5">
            Real-time pipeline with mathematical zero-duplicate-billing enforcement.
          </p>
        </div>

        <button
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#12191A] hover:bg-[#232F30] text-white rounded-lg text-xs font-mono font-medium shadow-sm transition-all disabled:opacity-50"
          disabled={loading}
          onClick={handleRunBatchBilling}
          type="button"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[#2F7D72]" />
          ) : (
            <Play className="w-4 h-4 text-[#2F7D72] fill-current" />
          )}
          <span>{loading ? "EXECUTING RUN..." : "RUN AUTOMATED BATCH BILLING"}</span>
        </button>
      </div>

      {/* Telemetry Result Banner */}
      {billingResult && (
        <div
          className={`p-4 rounded-lg mb-6 border flex items-start space-x-3 text-xs font-mono ${
            billingResult.skipped > 0
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          {billingResult.skipped > 0 ? (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-bold uppercase tracking-wider">
              {billingResult.skipped > 0
                ? "Idempotency Lock Engaged: Duplicate Billing Safely Prevented"
                : "Batch Billing Successfully Executed"}
            </div>
            <p className="mt-1 text-[11px]">
              Processed {billingResult.processed} accounts · Generated {billingResult.generated} new invoices (₹{billingResult.amount.toLocaleString("en-IN")}) · Safely prevented {billingResult.skipped} duplicate billing collisions.
            </p>
          </div>
        </div>
      )}

      {/* Kanban Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {/* Column 1: Due */}
        <div className="bg-[#F8FAF9] border border-[#E1E6E3] rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#5D6B6C] uppercase mb-3 font-semibold">
            <span>1. Due for Billing</span>
            <span className="px-1.5 py-0.5 bg-white rounded border border-[#E1E6E3]">
              {getStageCards("due").length}
            </span>
          </div>
          <div className="space-y-2">
            {getStageCards("due").map((c) => (
              <div key={c.id} className="bg-white p-3 rounded border border-[#E1E6E3] shadow-2xs">
                <div className="text-[10px] font-mono text-[#2F7D72] font-semibold">{c.subNumber}</div>
                <div className="font-bold text-xs text-[#111819] truncate">{c.companyName}</div>
                <div className="flex justify-between items-center text-[10px] text-[#5D6B6C] mt-2 pt-1 border-t border-[#E1E6E3]">
                  <span>{c.planName}</span>
                  <span className="font-mono font-bold text-[#111819]">₹{c.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
            {getStageCards("due").length === 0 && (
              <div className="text-center py-6 text-xs text-[#5D6B6C] font-mono">All cycles billed</div>
            )}
          </div>
        </div>

        {/* Column 2: Generated */}
        <div className="bg-[#F8FAF9] border border-[#E1E6E3] rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#5D6B6C] uppercase mb-3 font-semibold">
            <span>2. Invoices Created</span>
            <span className="px-1.5 py-0.5 bg-white rounded border border-[#E1E6E3]">
              {getStageCards("generated").length}
            </span>
          </div>
          <div className="space-y-2">
            {getStageCards("generated").map((c) => (
              <div key={c.id} className="bg-white p-3 rounded border border-[#2F7D72]/40 shadow-2xs">
                <div className="text-[10px] font-mono text-[#2F7D72] font-semibold">{c.subNumber}</div>
                <div className="font-bold text-xs text-[#111819] truncate">{c.companyName}</div>
                <div className="flex justify-between items-center text-[10px] text-[#5D6B6C] mt-2 pt-1 border-t border-[#E1E6E3]">
                  <span className="text-[#2F7D72]">Draft Invoiced</span>
                  <span className="font-mono font-bold text-[#111819]">₹{c.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Awaiting Payment */}
        <div className="bg-[#F8FAF9] border border-[#E1E6E3] rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#5D6B6C] uppercase mb-3 font-semibold">
            <span>3. In Transit</span>
            <span className="px-1.5 py-0.5 bg-white rounded border border-[#E1E6E3]">
              {getStageCards("awaiting").length}
            </span>
          </div>
          <div className="space-y-2">
            {getStageCards("awaiting").map((c) => (
              <div key={c.id} className="bg-white p-3 rounded border border-[#E1E6E3] shadow-2xs">
                <div className="text-[10px] font-mono text-[#5D6B6C] font-semibold">{c.subNumber}</div>
                <div className="font-bold text-xs text-[#111819] truncate">{c.companyName}</div>
                <div className="flex justify-between items-center text-[10px] text-[#5D6B6C] mt-2 pt-1 border-t border-[#E1E6E3]">
                  <span>NACH Mandate</span>
                  <span className="font-mono font-bold text-[#111819]">₹{c.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: Settled / Paid */}
        <div className="bg-[#F8FAF9] border border-[#E1E6E3] rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#2F7D72] uppercase mb-3 font-semibold">
            <span>4. Settled / Paid</span>
            <span className="px-1.5 py-0.5 bg-[#2F7D72]/10 text-[#2F7D72] rounded border border-[#2F7D72]/30">
              {getStageCards("settled").length}
            </span>
          </div>
          <div className="space-y-2">
            {getStageCards("settled").map((c) => (
              <div key={c.id} className="bg-white p-3 rounded border border-[#2F7D72]/30 shadow-2xs">
                <div className="text-[10px] font-mono text-[#2F7D72] font-semibold">{c.subNumber}</div>
                <div className="font-bold text-xs text-[#111819] truncate">{c.companyName}</div>
                <div className="flex justify-between items-center text-[10px] text-[#5D6B6C] mt-2 pt-1 border-t border-[#E1E6E3]">
                  <span className="text-[#2F7D72]">Reconciled</span>
                  <span className="font-mono font-bold text-[#111819]">₹{c.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 5: Dunning & Grace */}
        <div className="bg-[#F8FAF9] border border-[#D95C68]/30 rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#D95C68] uppercase mb-3 font-semibold">
            <span>5. Grace / Dunning</span>
            <span className="px-1.5 py-0.5 bg-[#D95C68]/10 text-[#D95C68] rounded border border-[#D95C68]/30">
              {getStageCards("dunning").length}
            </span>
          </div>
          <div className="space-y-2">
            {getStageCards("dunning").map((c) => (
              <div key={c.id} className="bg-white p-3 rounded border border-[#D95C68]/40 shadow-2xs">
                <div className="text-[10px] font-mono text-[#D95C68] font-semibold">{c.subNumber}</div>
                <div className="font-bold text-xs text-[#111819] truncate">{c.companyName}</div>
                <div className="flex justify-between items-center text-[10px] text-[#D95C68] mt-2 pt-1 border-t border-[#E1E6E3]">
                  <span>Past Due (3d)</span>
                  <span className="font-mono font-bold text-[#D95C68]">₹{c.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
