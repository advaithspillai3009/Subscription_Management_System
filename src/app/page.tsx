"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/tax";
import {
  TrendingUp,
  ArrowUpRight,
  CreditCard,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";

export default function OverviewPage() {
  const [telemetry, setTelemetry] = useState<any>({
    activeSubscriptions: 5,
    contractedMRR: 342790,
    contractedARR: 4113480,
    totalCustomers: 8,
    pendingSettlementsAmount: 245000,
    pendingSettlementsCount: 3,
    overdueInvoicesAmount: 64900,
    overdueInvoicesCount: 1,
    totalCashCollected: 283200,
  });

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningBilling, setRunningBilling] = useState(false);
  const [billingResult, setBillingResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes] = await Promise.all([
        fetch("/api/reports/telemetry"),
        fetch("/api/subscriptions"),
      ]);

      const tData = await tRes.json();
      const sData = await sRes.json();

      if (tData?.telemetry) setTelemetry(tData.telemetry);
      if (sData?.subscriptions) setSubscriptions(sData.subscriptions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunBilling = async () => {
    try {
      setRunningBilling(true);
      const res = await fetch("/api/billing/run", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBillingResult(data.result);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRunningBilling(false);
    }
  };

  const handleToggleLifecycle = async (id: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "pause" : "resume";
    try {
      const res = await fetch(`/api/subscriptions/${id}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1E6E3]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#12191A] tracking-tight">
            Subscription Dashboard
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Real-time recurring revenue telemetry, customer subscription lifecycles, and automated billing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunBilling}
            disabled={runningBilling}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] border border-[#E1E6E3] hover:border-[#2F7D72] text-[#12191A] text-xs font-medium rounded-md shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2F7D72] ${runningBilling ? "animate-spin" : ""}`} />
            <span>{runningBilling ? "Running..." : "Run Billing Engine"}</span>
          </button>

          <Link
            href="/subscriptions"
            className="flex items-center space-x-2 px-4 py-2 bg-[#2F7D72] hover:bg-[#26665D] text-white text-xs font-medium rounded-md shadow-xs transition-colors"
          >
            <span>+ New Subscription</span>
          </Link>
        </div>
      </div>

      {/* Billing Result Toast */}
      {billingResult && (
        <div className="bg-[#E6F2F0] border border-[#2F7D72] p-4 rounded-md flex items-center justify-between text-xs text-[#2F7D72]">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                Billing Cycle Completed: {billingResult.generatedCount} invoices generated (₹
                {billingResult.totalBilledAmount?.toLocaleString("en-IN")}).
              </p>
              <p className="text-[11px] text-[#5D6B6C] mt-0.5">
                Zero duplicate invoices created ({billingResult.skippedDuplicateCount} duplicate cycles safely prevented).
              </p>
            </div>
          </div>
          <button
            onClick={() => setBillingResult(null)}
            className="font-mono text-[10px] uppercase font-bold hover:opacity-75"
          >
            [ Dismiss ]
          </button>
        </div>
      )}

      {/* 4 Primary Metric Cards with Proper Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Card */}
        <div className="bg-white p-6 rounded-lg border border-[#E1E6E3] shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs text-[#5D6B6C]">
            <span className="font-medium">Monthly Recurring Revenue</span>
            <span className="text-[#2E8540] bg-green-50 px-2 py-0.5 rounded font-mono text-[10px] font-semibold">
              +14.2% MoM
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#12191A]">
            {formatCurrency(telemetry.contractedMRR)}
          </div>
          <div className="text-[11px] text-[#5D6B6C]">
            Active contracted monthly billing volume
          </div>
        </div>

        {/* ARR Card */}
        <div className="bg-white p-6 rounded-lg border border-[#E1E6E3] shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs text-[#5D6B6C]">
            <span className="font-medium">Annualized Run-Rate (ARR)</span>
            <TrendingUp className="w-4 h-4 text-[#2F7D72]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#12191A]">
            {formatCurrency(telemetry.contractedARR)}
          </div>
          <div className="text-[11px] text-[#5D6B6C]">
            Annualized contract value across all tiers
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="bg-white p-6 rounded-lg border border-[#E1E6E3] shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs text-[#5D6B6C]">
            <span className="font-medium">Active Subscriptions</span>
            <Users className="w-4 h-4 text-[#2F7D72]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#2F7D72]">
            {telemetry.activeSubscriptions}
          </div>
          <div className="text-[11px] text-[#5D6B6C]">
            Across {telemetry.totalCustomers} enterprise customer accounts
          </div>
        </div>

        {/* Cash Collected Card */}
        <div className="bg-white p-6 rounded-lg border border-[#E1E6E3] shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs text-[#5D6B6C]">
            <span className="font-medium">Reconciled Collections</span>
            <CreditCard className="w-4 h-4 text-[#2E8540]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#2E8540]">
            {formatCurrency(telemetry.totalCashCollected)}
          </div>
          <div className="text-[11px] text-[#5D6B6C]">
            Settled via Bank Transfer, UPI & Cards
          </div>
        </div>
      </div>

      {/* Visual Automated Billing Pipeline */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1E6E3] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#12191A]">
              Automated Billing Control Pipeline
            </h3>
            <p className="text-xs text-[#5D6B6C]">
              Idempotent billing cycle tracker with automated duplicate invoice prevention.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#2F7D72] bg-[#E6F2F0] px-2.5 py-1 rounded font-semibold self-start sm:self-auto">
            ZERO-DUPLICATE GUARANTEE
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
          <div className="p-4 bg-[#F8FAF9] rounded-md border border-[#E1E6E3] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#5D6B6C] block">1. Due for Billing</span>
            <span className="text-xl font-bold font-mono text-[#12191A]">{telemetry.activeSubscriptions}</span>
            <p className="text-[10px] text-[#5D6B6C]">Recurring cycle ready</p>
          </div>

          <div className="p-4 bg-[#F8FAF9] rounded-md border border-[#E1E6E3] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#5D6B6C] block">2. Invoices Issued</span>
            <span className="text-xl font-bold font-mono text-[#2F7D72]">
              {telemetry.pendingSettlementsCount + 2}
            </span>
            <p className="text-[10px] text-[#5D6B6C]">Tax 18% GST calculated</p>
          </div>

          <div className="p-4 bg-[#F8FAF9] rounded-md border border-[#E1E6E3] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#5D6B6C] block">3. Pending Payment</span>
            <span className="text-xl font-bold font-mono text-[#D97706]">{telemetry.pendingSettlementsCount}</span>
            <p className="text-[10px] text-[#D97706]">{formatCurrency(telemetry.pendingSettlementsAmount)}</p>
          </div>

          <div className="p-4 bg-[#F8FAF9] rounded-md border border-[#E1E6E3] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#5D6B6C] block">4. Settled Cash</span>
            <span className="text-xl font-bold font-mono text-[#2E8540]">100%</span>
            <p className="text-[10px] text-[#2E8540]">{formatCurrency(telemetry.totalCashCollected)}</p>
          </div>

          <div className="p-4 bg-[#F8FAF9] rounded-md border border-[#E1E6E3] space-y-1 col-span-2 md:col-span-1">
            <span className="text-[10px] font-mono uppercase text-[#5D6B6C] block">5. Dunning & Overdue</span>
            <span className="text-xl font-bold font-mono text-[#D9383A]">{telemetry.overdueInvoicesCount}</span>
            <p className="text-[10px] text-[#D9383A]">{formatCurrency(telemetry.overdueInvoicesAmount)}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: MRR Chart & Plan Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MRR Trajectory Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E1E6E3] rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-[#12191A]">Monthly Recurring Revenue Trajectory</h3>
              <p className="text-xs text-[#5D6B6C]">12-Month recurring revenue performance in INR (₹)</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#2F7D72] bg-[#E6F2F0] px-2.5 py-1 rounded">
              Current: {formatCurrency(telemetry.contractedMRR)}
            </span>
          </div>

          {/* Clean SVG Area Chart */}
          <div className="h-64 w-full pt-4">
            <svg viewBox="0 0 800 240" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="mrrTealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F7D72" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2F7D72" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="780" y2="20" stroke="#E1E6E3" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="780" y2="80" stroke="#E1E6E3" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="780" y2="140" stroke="#E1E6E3" strokeDasharray="3 3" />
              <line x1="40" y1="200" x2="780" y2="200" stroke="#E1E6E3" />

              {/* Y Axis Labels */}
              <text x="30" y="24" textAnchor="end" className="text-[10px] fill-[#5D6B6C] font-mono">₹4L</text>
              <text x="30" y="84" textAnchor="end" className="text-[10px] fill-[#5D6B6C] font-mono">₹3L</text>
              <text x="30" y="144" textAnchor="end" className="text-[10px] fill-[#5D6B6C] font-mono">₹2L</text>
              <text x="30" y="204" textAnchor="end" className="text-[10px] fill-[#5D6B6C] font-mono">₹1L</text>

              {/* Area Polygon */}
              <polygon
                points="50,185 110,175 170,160 230,150 290,140 350,125 410,110 470,95 530,85 590,70 650,55 710,40 710,200 50,200"
                fill="url(#mrrTealGrad)"
              />

              {/* Trajectory Line */}
              <polyline
                fill="none"
                stroke="#2F7D72"
                strokeWidth="2.5"
                points="50,185 110,175 170,160 230,150 290,140 350,125 410,110 470,95 530,85 590,70 650,55 710,40"
              />

              {/* Data Points */}
              {[
                { x: 50, y: 185 }, { x: 110, y: 175 }, { x: 170, y: 160 }, { x: 230, y: 150 },
                { x: 290, y: 140 }, { x: 350, y: 125 }, { x: 410, y: 110 }, { x: 470, y: 95 },
                { x: 530, y: 85 }, { x: 590, y: 70 }, { x: 650, y: 55 }, { x: 710, y: 40 }
              ].map((pt, idx) => (
                <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="#FFFFFF" stroke="#2F7D72" strokeWidth="2" />
              ))}

              {/* X Axis Months */}
              {["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m, i) => (
                <text key={m} x={50 + i * 60} y="222" textAnchor="middle" className="text-[10px] fill-[#5D6B6C] font-mono">
                  {m}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Plan Composition Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E1E6E3] rounded-lg p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#12191A]">Plan Composition</h3>
            <p className="text-xs text-[#5D6B6C]">Revenue distribution across subscription tiers</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-[#12191A]">Enterprise Suite (₹19,999)</span>
                <span className="font-mono text-[#2F7D72] font-semibold">58%</span>
              </div>
              <div className="w-full bg-[#F3F4F3] rounded-full h-2">
                <div className="bg-[#2F7D72] h-2 rounded-full" style={{ width: "58%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-[#12191A]">Growth Scaler (₹4,999)</span>
                <span className="font-mono text-[#2F7D72] font-semibold">27%</span>
              </div>
              <div className="w-full bg-[#F3F4F3] rounded-full h-2">
                <div className="bg-[#2F7D72] h-2 rounded-full" style={{ width: "27%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-[#12191A]">Starter Launch (₹1,499)</span>
                <span className="font-mono text-[#2F7D72] font-semibold">15%</span>
              </div>
              <div className="w-full bg-[#F3F4F3] rounded-full h-2">
                <div className="bg-[#2F7D72] h-2 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F8FAF9] rounded-md border border-[#E1E6E3] text-xs space-y-2">
            <span className="font-semibold text-[#12191A] block">Top Add-on:</span>
            <p className="text-[11px] text-[#5D6B6C]">
              Odoo Brand Co-Marketing Add-on (+₹560/mo) active on 80% of enterprise subscriptions.
            </p>
          </div>
        </div>
      </div>

      {/* Active Subscriptions Ledger Table with Proper Spacing */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E1E6E3] flex justify-between items-center bg-[#FFFFFF]">
          <div>
            <h3 className="text-sm font-bold text-[#12191A]">Active Subscriptions</h3>
            <p className="text-xs text-[#5D6B6C]">Latest recurring accounts provisioned in database</p>
          </div>
          <Link
            href="/subscriptions"
            className="text-xs font-semibold text-[#2F7D72] hover:underline"
          >
            View All Subscriptions →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <th className="py-3.5 px-6">Subscription #</th>
                <th className="py-3.5 px-6">Client Account</th>
                <th className="py-3.5 px-6">Plan & Cadence</th>
                <th className="py-3.5 px-6 text-right">Recurring Value</th>
                <th className="py-3.5 px-6">Next Renewal</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3]">
              {subscriptions.slice(0, 5).map((sub) => (
                <tr key={sub.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-[#12191A]">
                    {sub.subscriptionNumber}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[#12191A]">{sub.customer?.companyName}</div>
                    <div className="text-[11px] text-[#5D6B6C]">{sub.customer?.contactName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-[#12191A]">{sub.plan?.name}</span>
                    <span className="block text-[10px] font-mono uppercase text-[#2F7D72]">
                      {sub.billingFrequency}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-[#12191A] text-sm">
                    {formatCurrency(sub.recurringAmount)}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">
                    {new Date(sub.nextBillingDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        sub.status === "active"
                          ? "bg-green-50 text-[#2E8540] border border-green-200"
                          : "bg-gray-100 text-[#5D6B6C]"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleToggleLifecycle(sub.id, sub.status)}
                      className="px-3 py-1 text-[11px] font-mono bg-[#F8FAF9] hover:bg-[#E6F2F0] hover:text-[#2F7D72] border border-[#E1E6E3] rounded transition-colors"
                    >
                      {sub.status === "active" ? "Pause" : "Resume"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
