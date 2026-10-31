"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CassetteVisualizer from "@/components/CassetteVisualizer";
import BillingPipeline from "@/components/BillingPipeline";
import {
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  CreditCard,
  Users,
  ShieldCheck,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function OverviewPage() {
  const [telemetry, setTelemetry] = useState<any>({
    activeSubscriptions: 1428,
    activeSubscriptionsGrowth: 12.4,
    contractedMRR: 4285000,
    contractedMRRGrowth: 14.2,
    contractedARR: 51420000,
    totalCustomers: 894,
    pendingSettlementsAmount: 645000,
    pendingSettlementsCount: 14,
    overdueInvoicesAmount: 210000,
    overdueInvoicesCount: 3,
    totalCashCollected: 3865000,
  });

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    // Fetch live telemetry from API
    fetch("/api/reports/telemetry")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.telemetry) {
          setTelemetry(data.telemetry);
        }
      })
      .catch(() => {});

    // Fetch live subscriptions
    fetch("/api/subscriptions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      })
      .catch(() => {});
  }, []);

  const filteredSubs = subscriptions.filter((s) => {
    if (filterType === "all") return true;
    if (filterType === "enterprise") return s.plan?.name?.includes("Enterprise");
    if (filterType === "at-risk") return s.status === "paused" || s.customer?.companyName?.includes("Indus");
    return true;
  });

  return (
    <div className="space-y-10">
      {/* HERO SECTION: Typographic Scale + Cassette Object (Exact Proportions from Stitch reference) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hero Column: Typographic Focus */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center pt-2">
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest text-[#5D6B6C] mb-5">
            <span className="w-2 h-2 rounded-full bg-[#2F7D72]" />
            <span className="uppercase font-medium">
              RECURRING REVENUE ENGINE · BENGALURU, IN
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-[#111819] leading-[1.08] mb-6 font-display">
            Predictable scale.
            <br />
            Built to{" "}
            <span className="text-[#2F7D72] font-normal underline decoration-1 underline-offset-8">
              compound
            </span>
            .
          </h1>

          <p className="text-[#5D6B6C] text-base sm:text-lg leading-relaxed max-w-xl mb-8 font-normal font-sans">
            Orion automates subscription lifecycles, dunning recovery, and multi-tier usage billing for high-velocity Indian SaaS enterprises.
          </p>

          {/* CTA Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link
              className="flex items-center space-x-2.5 px-6 py-3.5 bg-[#12191A] text-[#FFFFFF] font-semibold text-sm rounded hover:bg-[#222E30] transition-all shadow-sm group"
              href="/subscriptions"
            >
              <span>Deploy New Subscription</span>
              <ArrowUpRight className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              className="flex items-center space-x-2 px-6 py-3.5 bg-[#FFFFFF] border border-[#DDE2DF] text-[#111819] hover:border-[#2F7D72] hover:text-[#2F7D72] transition-colors text-sm font-medium rounded shadow-2xs"
              href="/invoices"
            >
              <span>Run automated dunning</span>
              <ArrowRight className="w-4 h-4 text-[#5D6B6C]" />
            </Link>
          </div>

          {/* Footnote Status matching reference image */}
          <div className="flex items-center space-x-4 text-xs font-mono text-[#5D6B6C]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#2F7D72]" />
              <span>Available for enterprise deployment</span>
            </div>
            <span className="text-[#DDE2DF]">/</span>
            <span className="text-[#5D6B6C]/80 font-sans">よろしく。</span>
          </div>
        </div>

        {/* Right Hero Column: ORION INTELLIGENCE OBJECT NO. 001 (Cassette Container) */}
        <div className="lg:col-span-6 xl:col-span-7">
          <CassetteVisualizer mrrAmount={telemetry.contractedMRR} />
        </div>
      </section>

      {/* DASHBOARD TELEMETRY: 6 Precision Metric Cards adhering strictly to light studio palette */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#5D6B6C] flex items-center space-x-2 font-medium">
            <span className="w-1.5 h-1.5 bg-[#2F7D72] rounded-full" />
            <span>B2B REVENUE TELEMETRY // CURRENT FISCAL</span>
          </h2>
          <span className="text-xs font-mono text-[#5D6B6C]/80">UPDATED 2 MINS AGO</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* KPI 1: Active Subscriptions */}
          <div className="bg-[#FFFFFF] border border-[#E1E6E3] p-4 rounded-lg relative overflow-hidden hover:border-[#2F7D72] transition-all shadow-card-subtle">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5D6B6C] mb-2 font-medium">
              <span>ACTIVE SUBSCRIPTIONS</span>
              <span className="text-[#2F7D72] bg-[#2F7D72]/10 font-bold px-1.5 py-0.5 rounded">
                +{telemetry.activeSubscriptionsGrowth}%
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111819] font-mono tracking-tight">
              {telemetry.activeSubscriptions.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#5D6B6C] mt-1">99.1% retention rate</div>
          </div>

          {/* KPI 2: MRR */}
          <div className="bg-[#FFFFFF] border border-[#E1E6E3] p-4 rounded-lg relative overflow-hidden hover:border-[#2F7D72] transition-all shadow-card-subtle">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5D6B6C] mb-2 font-medium">
              <span>MRR (INR ₹)</span>
              <span className="text-[#2F7D72] bg-[#2F7D72]/10 font-bold px-1.5 py-0.5 rounded">
                +{telemetry.contractedMRRGrowth}%
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111819] font-mono tracking-tight">
              ₹{telemetry.contractedMRR.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#5D6B6C] mt-1">+₹5.32L new expansion</div>
          </div>

          {/* KPI 3: ARR */}
          <div className="bg-[#FFFFFF] border border-[#E1E6E3] p-4 rounded-lg relative overflow-hidden hover:border-[#2F7D72] transition-all shadow-card-subtle">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5D6B6C] mb-2 font-medium">
              <span>ARR RUN-RATE</span>
              <span className="text-[#2F7D72] bg-[#2F7D72]/10 font-bold px-1.5 py-0.5 rounded">
                +18.6%
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111819] font-mono tracking-tight">
              ₹{(telemetry.contractedARR / 10000000).toFixed(2)} Cr
            </div>
            <div className="text-[11px] text-[#5D6B6C] mt-1">Goal: ₹6.50 Cr by Q4</div>
          </div>

          {/* KPI 4: Total Customers */}
          <div className="bg-[#FFFFFF] border border-[#E1E6E3] p-4 rounded-lg relative overflow-hidden hover:border-[#2F7D72] transition-all shadow-card-subtle">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5D6B6C] mb-2 font-medium">
              <span>TOTAL CUSTOMERS</span>
              <span className="text-[#2F7D72] bg-[#2F7D72]/10 font-bold px-1.5 py-0.5 rounded">
                +8 new
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111819] font-mono tracking-tight">
              {telemetry.totalCustomers}
            </div>
            <div className="text-[11px] text-[#5D6B6C] mt-1">46 Enterprise Tier</div>
          </div>

          {/* KPI 5: Pending Settlements */}
          <div className="bg-[#FFFFFF] border border-[#E1E6E3] p-4 rounded-lg relative overflow-hidden hover:border-[#2F7D72] transition-all shadow-card-subtle">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5D6B6C] mb-2 font-medium">
              <span>PENDING SETTLEMENTS</span>
              <span className="text-[#C98C2E] bg-[#C98C2E]/10 font-bold px-1.5 py-0.5 rounded">
                {telemetry.pendingSettlementsCount} Inv
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111819] font-mono tracking-tight">
              ₹{telemetry.pendingSettlementsAmount.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#5D6B6C] mt-1">Avg turnaround: 1.8d</div>
          </div>

          {/* KPI 6: Overdue Invoices */}
          <div className="bg-[#FFFFFF] border border-[#E1E6E3] p-4 rounded-lg relative overflow-hidden hover:border-[#D95C68] transition-all shadow-card-subtle border-l-4 border-l-[#D95C68]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#5D6B6C] mb-2 font-medium">
              <span className="text-[#D95C68] flex items-center space-x-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D95C68]" />
                <span>OVERDUE INVOICES</span>
              </span>
              <span className="text-[#D95C68] bg-[#D95C68]/10 font-bold px-1.5 py-0.5 rounded font-mono">
                {telemetry.overdueInvoicesCount} Accts
              </span>
            </div>
            <div className="text-2xl font-bold text-[#111819] font-mono tracking-tight">
              ₹{telemetry.overdueInvoicesAmount.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-[#D95C68]">Smart dunning active</div>
          </div>
        </div>
      </section>

      {/* REVENUE GROWTH & PLAN BREAKDOWN SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Chart View: Light Mode Precision Line Chart */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#E1E6E3] rounded-xl p-6 sm:p-7 shadow-card-subtle">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E1E6E3] pb-4 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-[#2F7D72] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2F7D72]" />
                <span className="tracking-wider">MRR TRAJECTORY & FORECAST MATRIX</span>
              </div>
              <h3 className="text-lg font-bold text-[#111819] mt-0.5 font-display">
                12-Month Recurring Revenue Expansion
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <button className="px-2.5 py-1 bg-[#12191A] text-[#FFFFFF] font-medium rounded shadow-xs" type="button">
                Monthly
              </button>
              <button className="px-2.5 py-1 bg-[#F3F5F4] text-[#5D6B6C] hover:text-[#111819] border border-[#E1E6E3] rounded transition-colors" type="button">
                Quarterly
              </button>
              <button className="px-2.5 py-1 bg-[#F3F5F4] text-[#5D6B6C] hover:text-[#111819] border border-[#E1E6E3] rounded transition-colors" type="button">
                Annual
              </button>
            </div>
          </div>

          {/* SVG Line Chart with sage teal gradient matching Stitch design */}
          <div className="relative w-full h-64 sm:h-72">
            <svg className="w-full h-full overflow-visible" fill="none" viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sageTealGrad" x1="0" x2="0" y1="0" y2="240" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2F7D72" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#2F7D72" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line stroke="#E1E6E3" strokeDasharray="3 3" x1="0" x2="700" y1="30" y2="30" />
              <line stroke="#E1E6E3" strokeDasharray="3 3" x1="0" x2="700" y1="85" y2="85" />
              <line stroke="#E1E6E3" strokeDasharray="3 3" x1="0" x2="700" y1="140" y2="140" />
              <line stroke="#E1E6E3" x1="0" x2="700" y1="195" y2="195" />

              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="5" y="26">₹50L</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="5" y="81">₹38L</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="5" y="136">₹26L</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="5" y="191">₹14L</text>

              <path d="M 40 185 Q 120 165, 180 145 T 320 115 T 460 70 T 600 45 L 670 32 L 670 200 L 40 200 Z" fill="url(#sageTealGrad)" />
              <path d="M 40 185 Q 120 165, 180 145 T 320 115 T 460 70 T 600 45 L 670 32" fill="none" stroke="#2F7D72" strokeLinecap="round" strokeWidth="2.5" />

              <circle cx="180" cy="145" fill="#FFFFFF" r="4.5" stroke="#2F7D72" strokeWidth="2.5" />
              <circle cx="320" cy="115" fill="#FFFFFF" r="4.5" stroke="#2F7D72" strokeWidth="2.5" />
              <circle cx="460" cy="70" fill="#FFFFFF" r="4.5" stroke="#2F7D72" strokeWidth="2.5" />
              <circle cx="670" cy="32" fill="#2F7D72" r="5" stroke="#FFFFFF" strokeWidth="2.5" />

              <g transform="translate(550, 5)">
                <rect fill="#12191A" height="24" rx="4" width="125" />
                <text fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="62" y="16">
                  ₹42.85L (CURRENT)
                </text>
              </g>

              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="40" y="222">NOV</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="145" y="222">JAN</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="250" y="222">MAR</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="355" y="222">MAY</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="460" y="222">JUL</text>
              <text fill="#5D6B6C" fontFamily="JetBrains Mono" fontSize="10" x="565" y="222">SEP</text>
              <text fill="#2F7D72" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" x="655" y="222">OCT</text>
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-[#5D6B6C] pt-4 border-t border-[#E1E6E3] mt-2">
            <span>COMPOUND EXPANSION: <strong className="text-[#2F7D72]">+3.4% MoM</strong></span>
            <span>NET RETENTION: <strong className="text-[#2F7D72]">118.2%</strong></span>
            <span>CHURN RATE: <strong className="text-[#2F7D72]">0.64%</strong></span>
          </div>
        </div>

        {/* Right Column: Plan Composition */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E1E6E3] rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-card-subtle">
          <div>
            <div className="flex items-center justify-between border-b border-[#E1E6E3] pb-3 mb-5">
              <span className="text-xs font-mono text-[#5D6B6C] uppercase tracking-wider font-semibold">
                PLAN COMPOSITION
              </span>
              <span className="text-[10px] font-mono text-[#2F7D72] font-bold">4 TIERS ACTIVE</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#111819] font-medium">Enterprise Custom (₹1,50,000+/mo)</span>
                  <span className="font-mono text-[#2F7D72] font-bold">54%</span>
                </div>
                <div className="w-full bg-[#F3F5F4] h-2 rounded-full overflow-hidden border border-[#E1E6E3]">
                  <div className="bg-[#2F7D72] h-full rounded-full" style={{ width: "54%" }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#5D6B6C] mt-0.5">
                  <span>46 Accounts</span>
                  <span>₹23,13,900 MRR</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#111819] font-medium">Scale Tier (₹45,000/mo)</span>
                  <span className="font-mono text-[#2F7D72] font-bold">28%</span>
                </div>
                <div className="w-full bg-[#F3F5F4] h-2 rounded-full overflow-hidden border border-[#E1E6E3]">
                  <div className="bg-[#2F7D72]/80 h-full rounded-full" style={{ width: "28%" }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#5D6B6C] mt-0.5">
                  <span>268 Accounts</span>
                  <span>₹11,99,800 MRR</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#111819] font-medium">Growth Tier (₹18,000/mo)</span>
                  <span className="font-mono text-[#2F7D72] font-bold">14%</span>
                </div>
                <div className="w-full bg-[#F3F5F4] h-2 rounded-full overflow-hidden border border-[#E1E6E3]">
                  <div className="bg-[#2F7D72]/60 h-full rounded-full" style={{ width: "14%" }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#5D6B6C] mt-0.5">
                  <span>330 Accounts</span>
                  <span>₹5,99,900 MRR</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#111819] font-medium">Starter Core (₹6,500/mo)</span>
                  <span className="font-mono text-[#2F7D72] font-bold">4%</span>
                </div>
                <div className="w-full bg-[#F3F5F4] h-2 rounded-full overflow-hidden border border-[#E1E6E3]">
                  <div className="bg-[#2F7D72]/30 h-full rounded-full" style={{ width: "4%" }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#5D6B6C] mt-0.5">
                  <span>250 Accounts</span>
                  <span>₹1,71,400 MRR</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E1E6E3] grid grid-cols-2 gap-4">
            <div className="bg-[#F3F5F4] border border-[#E1E6E3] p-3 rounded-lg text-center">
              <div className="text-[10px] font-mono text-[#5D6B6C] font-medium">LTV : CAC</div>
              <div className="text-xl font-bold font-mono text-[#2F7D72] mt-0.5">4.8x</div>
              <div className="text-[10px] text-[#5D6B6C]/80">Target &gt; 3.5x</div>
            </div>
            <div className="bg-[#F3F5F4] border border-[#E1E6E3] p-3 rounded-lg text-center">
              <div className="text-[10px] font-mono text-[#5D6B6C] font-medium">CAC PAYBACK</div>
              <div className="text-xl font-bold font-mono text-[#111819] mt-0.5">5.2 Mo</div>
              <div className="text-[10px] text-[#5D6B6C]/80">Top Tier SaaS</div>
            </div>
          </div>
        </div>
      </section>

      {/* HACKATHON DIFFERENTIATOR: AUTOMATED BILLING CONTROL PIPELINE */}
      <section>
        <BillingPipeline />
      </section>

      {/* CORE SUBSCRIPTION TABLE (LIVE RECURRING LEDGER) */}
      <section className="bg-[#FFFFFF] border border-[#E1E6E3] rounded-xl p-6 sm:p-7 shadow-card-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E6E3] pb-5 mb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#2F7D72] mb-1 font-semibold">
              <span className="w-1.5 h-1.5 bg-[#2F7D72] rounded-full" />
              <span>LIVE RECURRING LEDGER</span>
            </div>
            <h3 className="text-xl font-bold text-[#111819]">Recent Subscriptions & Accounts</h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-[#F3F5F4] border border-[#E1E6E3] rounded-lg p-1 text-xs">
              <button
                className={`px-3 py-1 rounded font-mono transition-colors ${
                  filterType === "all" ? "bg-white text-[#111819] font-medium shadow-2xs" : "text-[#5D6B6C]"
                }`}
                onClick={() => setFilterType("all")}
                type="button"
              >
                All (1,428)
              </button>
              <button
                className={`px-3 py-1 rounded font-mono transition-colors ${
                  filterType === "enterprise" ? "bg-white text-[#111819] font-medium shadow-2xs" : "text-[#5D6B6C]"
                }`}
                onClick={() => setFilterType("enterprise")}
                type="button"
              >
                Enterprise
              </button>
              <button
                className={`px-3 py-1 rounded font-mono transition-colors ${
                  filterType === "at-risk" ? "bg-white text-[#D95C68] font-bold shadow-2xs" : "text-[#5D6B6C]"
                }`}
                onClick={() => setFilterType("at-risk")}
                type="button"
              >
                At Risk (3)
              </button>
            </div>

            <Link
              className="px-3.5 py-1.5 bg-[#12191A] text-white hover:bg-[#232F30] text-xs font-mono rounded transition-colors flex items-center space-x-1.5 shadow-2xs"
              href="/subscriptions"
            >
              <span>View Full Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E1E6E3] text-[11px] font-mono uppercase text-[#5D6B6C] tracking-wider bg-[#F8FAF9]">
                <th className="py-3 px-3">Subscription</th>
                <th className="py-3 px-3">Customer & Company</th>
                <th className="py-3 px-3">Plan Variant</th>
                <th className="py-3 px-3">Billing Cycle</th>
                <th className="py-3 px-3 text-right">MRR Amount (₹)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3] text-xs">
              {filteredSubs.map((sub) => {
                const isOverdue = sub.customer?.companyName?.includes("Indus");
                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-[#F8FAF9] transition-colors group ${
                      isOverdue ? "bg-[#C98C2E]/5" : ""
                    }`}
                  >
                    <td className="py-3.5 px-3 font-mono text-[#2F7D72] font-semibold">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#111819]">{sub.customer?.companyName}</div>
                      <div className="text-[11px] text-[#5D6B6C] font-mono">
                        {sub.customer?.billingCity?.toUpperCase() || "INDIA"}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[#111819] font-medium">{sub.plan?.name}</span>
                      <div className="text-[10px] text-[#5D6B6C]">
                        {sub.lines?.[0]?.description || "Standard SaaS Scope"}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#5D6B6C] capitalize">
                      {sub.billingFrequency}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#111819]">
                      ₹{sub.totalRecurringAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-3">
                      {isOverdue ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#C98C2E]/15 text-[#C98C2E] border border-[#C98C2E]/40 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C98C2E] mr-1.5 animate-pulse" />
                          In Grace (3d)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2F7D72]/10 text-[#2F7D72] border border-[#2F7D72]/30 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D72] mr-1.5" />
                          {sub.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        className="px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#12191A] hover:text-[#FFFFFF] text-[#111819] border border-[#DDE2DF] rounded font-mono text-[11px] transition-colors shadow-2xs"
                        href="/subscriptions"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
