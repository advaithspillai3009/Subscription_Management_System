"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cycleFilter, setCycleFilter] = useState("all");

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [newSub, setNewSub] = useState({
    customerId: "",
    planId: "",
    billingFrequency: "monthly",
    quantity: 1,
  });

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subscriptions?search=${search}&status=${statusFilter}`);
      const data = await res.json();
      if (data.subscriptions) {
        setSubscriptions(data.subscriptions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [search, statusFilter]);

  useEffect(() => {
    // Load customers and plans for modal
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []));
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setPlans(data.plans || []));
  }, []);

  const handleLifecycleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        loadSubscriptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPlan = plans.find((p) => p.id === newSub.planId);
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: newSub.customerId,
          planId: newSub.planId,
          billingFrequency: newSub.billingFrequency,
          lines: [
            {
              productId: selectedPlan?.id || "",
              description: `${selectedPlan?.name || "SaaS Plan"} Core Subscription`,
              quantity: parseInt(newSub.quantity.toString()) || 1,
              unitPrice: selectedPlan?.basePrice || 18000,
            },
          ],
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadSubscriptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Viewport Context Header matching Stitch Subscriptions Ledger */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E1E6E3] pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5D6B6C]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D72]" />
            <span className="text-[#2F7D72] font-semibold">定期契約統括</span>
            <span>//</span>
            <span>RECURRING LIFECYCLE REPOSITORY</span>
            <span>//</span>
            <span className="text-[#111819] font-medium">NODE-BLR-04</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111819] font-display">
            Subscriptions & Contracts
          </h1>
          <p className="text-sm text-[#5D6B6C] max-w-2xl font-normal">
            Manage recurring lifecycles, upgrades, automated renewals, and churn mitigation powered by ORION AI across Indian B2B enterprise accounts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-[#12191A] text-white rounded text-xs font-mono font-medium hover:bg-[#232F30] transition-colors shadow-sm"
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy Subscription</span>
          </button>
        </div>
      </section>

      {/* Filter Rail */}
      <section className="bg-white border border-[#E1E6E3] p-4 rounded-xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 shadow-card-subtle">
        {/* Search */}
        <div className="flex-1 max-w-lg flex items-center bg-[#F3F5F4] border border-[#E1E6E3] rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-[#5D6B6C] mr-2" />
          <input
            className="w-full bg-transparent border-0 outline-none text-xs text-[#111819] placeholder-[#5D6B6C]/70 font-mono"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by customer, contract ID, plan..."
            type="text"
            value={search}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 bg-[#F3F5F4] border border-[#E1E6E3] rounded px-3 py-1.5">
            <span className="text-[#5D6B6C]">STATUS:</span>
            <select
              className="bg-transparent border-0 outline-none text-[#111819] font-semibold cursor-pointer"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-[#F3F5F4] border border-[#E1E6E3] rounded px-3 py-1.5">
            <span className="text-[#5D6B6C]">CYCLE:</span>
            <select
              className="bg-transparent border-0 outline-none text-[#111819] font-semibold cursor-pointer"
              onChange={(e) => setCycleFilter(e.target.value)}
              value={cycleFilter}
            >
              <option value="all">All Cycles</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <button
            className="px-3 py-1.5 rounded bg-[#F3F5F4] border border-[#E1E6E3] hover:bg-[#E8F2EF] text-[#111819] transition-colors"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setCycleFilter("all");
            }}
            type="button"
          >
            RESET
          </button>
        </div>
      </section>

      {/* Subscriptions Ledger Table */}
      <section className="bg-white border border-[#E1E6E3] rounded-xl overflow-hidden shadow-card-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E6E3] text-[11px] font-mono text-[#5D6B6C] uppercase tracking-wider">
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Plan & Scope</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4 text-right">MRR Value (₹)</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3] text-xs">
              {subscriptions.map((sub) => {
                const isOverdue = sub.customer?.companyName?.includes("Indus");
                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-[#F8FAF9] transition-colors group ${
                      isOverdue ? "bg-[#C98C2E]/5" : ""
                    }`}
                  >
                    <td className="py-4 px-4 font-mono font-semibold text-[#2F7D72]">
                      {sub.subscriptionNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-sm text-[#111819]">
                        {sub.customer?.companyName}
                      </div>
                      <div className="text-[11px] text-[#5D6B6C] font-mono">
                        {sub.customer?.billingCity?.toUpperCase() || "INDIA"} · {sub.customer?.gstin || "GST REGD"}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#111819]">{sub.plan?.name}</div>
                      <div className="text-[11px] text-[#5D6B6C]">
                        {sub.lines?.[0]?.description || "Enterprise Scope"}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[#5D6B6C] capitalize">
                      {sub.billingFrequency}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-sm text-[#111819]">
                      ₹{sub.totalRecurringAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="py-4 px-4 font-mono text-[#5D6B6C]">
                      <div>{new Date(sub.nextBillingDate).toLocaleDateString("en-IN")}</div>
                      {isOverdue && (
                        <div className="text-[10px] text-[#C98C2E] font-bold">
                          PAST DUE (3D GRACE)
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {sub.status === "paused" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-gray-100 text-gray-700 border border-gray-300 font-semibold">
                          PAUSED
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#C98C2E]/15 text-[#C98C2E] border border-[#C98C2E]/40 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C98C2E] mr-1.5 animate-pulse" />
                          IN GRACE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#2F7D72]/10 text-[#2F7D72] border border-[#2F7D72]/30 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D72] mr-1.5" />
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {sub.status === "active" ? (
                          <button
                            className="px-2 py-1 bg-white hover:bg-gray-100 text-[#111819] border border-[#DDE2DF] rounded font-mono text-[10px] transition-colors"
                            onClick={() => handleLifecycleAction(sub.id, "pause")}
                            title="Pause Subscription"
                            type="button"
                          >
                            Pause
                          </button>
                        ) : (
                          <button
                            className="px-2 py-1 bg-[#2F7D72] text-white hover:bg-[#23635A] rounded font-mono text-[10px] transition-colors"
                            onClick={() => handleLifecycleAction(sub.id, "resume")}
                            title="Resume Subscription"
                            type="button"
                          >
                            Resume
                          </button>
                        )}

                        <button
                          className="px-2 py-1 bg-white hover:bg-[#12191A] hover:text-white text-[#111819] border border-[#DDE2DF] rounded font-mono text-[10px] transition-colors"
                          onClick={() => handleLifecycleAction(sub.id, "renew")}
                          title="Renew Contract 1 Year"
                          type="button"
                        >
                          Renew
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Deploy New Subscription */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#E1E6E3] rounded-xl max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E1E6E3] pb-3 mb-4">
              <h3 className="font-bold text-base text-[#111819]">Deploy New Subscription Contract</h3>
              <button onClick={() => setIsModalOpen(false)} type="button">
                <X className="w-4 h-4 text-[#5D6B6C]" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Enterprise Customer</label>
                <select
                  className="w-full bg-[#F8FAF9] border border-[#E1E6E3] rounded p-2 text-xs"
                  onChange={(e) => setNewSub({ ...newSub, customerId: e.target.value })}
                  required
                  value={newSub.customerId}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.billingCity || "India"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Select Recurring Plan</label>
                <select
                  className="w-full bg-[#F8FAF9] border border-[#E1E6E3] rounded p-2 text-xs"
                  onChange={(e) => setNewSub({ ...newSub, planId: e.target.value })}
                  required
                  value={newSub.planId}
                >
                  <option value="">-- Choose Plan --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.basePrice.toLocaleString("en-IN")}/{p.frequency}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Billing Frequency</label>
                  <select
                    className="w-full bg-[#F8FAF9] border border-[#E1E6E3] rounded p-2 text-xs"
                    onChange={(e) => setNewSub({ ...newSub, billingFrequency: e.target.value })}
                    value={newSub.billingFrequency}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Seats / Quantity</label>
                  <input
                    className="w-full bg-[#F8FAF9] border border-[#E1E6E3] rounded p-2 text-xs"
                    min="1"
                    onChange={(e) => setNewSub({ ...newSub, quantity: parseInt(e.target.value) || 1 })}
                    type="number"
                    value={newSub.quantity}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E1E6E3] flex justify-end space-x-2">
                <button
                  className="px-4 py-2 border border-[#E1E6E3] rounded text-[#5D6B6C] hover:bg-gray-50"
                  onClick={() => setIsModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 bg-[#12191A] text-white rounded font-semibold hover:bg-[#232F30]"
                  type="submit"
                >
                  Confirm & Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
