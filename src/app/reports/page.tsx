"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Download, TrendingUp, BarChart3, PieChart, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);

  const monthlyRevenue = [
    { month: "Jun 2026", mrr: 580000, newSubs: 24, churned: 2 },
    { month: "Jul 2026", mrr: 640000, newSubs: 31, churned: 1 },
    { month: "Aug 2026", mrr: 710000, newSubs: 38, churned: 3 },
    { month: "Sep 2026", mrr: 790000, newSubs: 42, churned: 2 },
    { month: "Oct 2026", mrr: 842600, newSubs: 49, churned: 2 },
    { month: "Nov 2026", mrr: 915000, newSubs: 54, churned: 1 },
  ];

  const planBreakdown = [
    { name: "Growth Scaler", active: 520, mrr: 2599480, share: "56%" },
    { name: "Enterprise Suite", active: 145, mrr: 2899855, share: "32%" },
    { name: "Starter Launch", active: 619, mrr: 927881, share: "12%" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0D530E] tracking-tight font-normal">
            Financial & Revenue Reports
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Monthly recurring revenue trends, churn telemetry, plan performance, and financial audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FBF5DD] border border-[#D8D1A4] hover:bg-[#E7E1B1]/40 text-[#0D530E] text-xs font-medium rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] text-xs font-medium rounded-xl transition-all"
          >
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Row: Thin vertical dividers matching Reference A */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 py-2 border-y border-[#D8D1A4]/60">
        <div className="pr-4 lg:pr-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Current MRR</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal flex items-baseline space-x-2">
            <span>₹9,15,000</span>
            <span className="text-xs font-sans text-[#306D29] font-medium">▲ 8.6%</span>
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Monthly recurring pace</div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">ARR Run Rate</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            ₹1,09,80,000
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Annualized baseline</div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Net Revenue Retention</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#306D29] mt-1 font-normal">
            114.2%
          </div>
          <div className="text-[11px] text-[#306D29] mt-0.5">Strong account expansion</div>
        </div>

        <div className="pl-4 lg:pl-6">
          <div className="text-xs text-[#0D530E]/70 font-sans">Logo Churn Rate</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            0.8%
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Top-decile B2B retention</div>
        </div>
      </div>

      {/* 2-Column Grid: Revenue Trajectory + Plan Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Minimal Bar Chart matching Reference A */}
        <div className="lg:col-span-7 border border-[#D8D1A4] rounded-2xl p-6 bg-[#FBF5DD] space-y-6">
          <div className="flex items-center justify-between border-b border-[#D8D1A4]/60 pb-3">
            <div>
              <h2 className="font-serif text-lg text-[#0D530E] font-normal">
                Monthly Recurring Revenue Trajectory
              </h2>
              <p className="text-xs text-[#0D530E]/65 mt-0.5">
                Past 6 months sustained expansion (in Lakhs INR)
              </p>
            </div>
            <span className="text-xs font-mono text-[#306D29] font-medium bg-[#E7E1B1] px-2.5 py-1 rounded-md">
              +57% YoY
            </span>
          </div>

          <div className="pt-4 pb-2">
            <div className="flex items-end justify-between h-48 px-4 border-b border-[#D8D1A4]">
              {monthlyRevenue.map((d, i) => {
                const heightPercent = (d.mrr / 1000000) * 100;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 mx-2 group">
                    <div className="text-[10px] text-[#0D530E]/60 font-mono mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(d.mrr / 100000).toFixed(1)}L
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[38px] bg-[#306D29] rounded-t-sm hover:bg-[#0D530E] transition-colors"
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between px-4 pt-2 text-[11px] text-[#0D530E]/70 font-sans">
              {monthlyRevenue.map((d, i) => (
                <span key={i} className="flex-1 text-center truncate">
                  {d.month.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Breakdown Card with Pale-Yellow Header (#E7E1B1) */}
        <div className="lg:col-span-5 border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD] flex flex-col justify-between">
          <div className="bg-[#E7E1B1] px-6 py-4 border-b border-[#D8D1A4]">
            <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
              Plan Distribution & MRR Share
            </h2>
            <p className="text-xs text-[#0D530E]/70 mt-0.5">
              Portfolio split across tier subscriptions
            </p>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {planBreakdown.map((plan, idx) => (
              <div key={idx} className="p-3.5 bg-[#E7E1B1]/30 border border-[#D8D1A4] rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#0D530E]">{plan.name}</span>
                  <span className="font-serif text-[#0D530E]">{formatCurrency(plan.mrr)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#0D530E]/65">
                  <span>{plan.active} subscribers</span>
                  <span>{plan.share} of total MRR</span>
                </div>
                <div className="w-full bg-[#D8D1A4]/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#306D29] h-full"
                    style={{ width: plan.share }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#FBF5DD] border-t border-[#D8D1A4]/60 text-center text-xs text-[#0D530E]/70">
            Audit status: Certified compliant with Indian GAAP & GST regulations
          </div>
        </div>

      </div>

      {/* Monthly Audit Ledger Table with Pale-Yellow Header */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
        <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
          <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
            Monthly Performance Ledger
          </h2>
          <span className="text-xs text-[#0D530E]/70 font-sans">
            Historical 6-month fiscal cycle
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
              <th className="py-3 px-6">Billing Period</th>
              <th className="py-3 px-6 text-right">Recognized MRR</th>
              <th className="py-3 px-6 text-center">New Additions</th>
              <th className="py-3 px-6 text-center">Churned Accounts</th>
              <th className="py-3 px-6 text-right">Net Growth Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D1A4]/60">
            {monthlyRevenue.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#E7E1B1]/25 transition-colors">
                <td className="py-4 px-6 font-medium text-[#0D530E]">{row.month}</td>
                <td className="py-4 px-6 text-right font-serif text-sm text-[#0D530E]">
                  {formatCurrency(row.mrr)}
                </td>
                <td className="py-4 px-6 text-center text-[#306D29] font-medium font-mono">
                  +{row.newSubs}
                </td>
                <td className="py-4 px-6 text-center text-[#C5221F] font-mono">
                  -{row.churned}
                </td>
                <td className="py-4 px-6 text-right font-mono text-[#306D29]">
                  +{((row.newSubs / (row.newSubs + 100)) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

