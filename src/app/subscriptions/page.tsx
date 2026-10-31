"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import {
  Search,
  Plus,
  Play,
  Pause,
  RefreshCw,
  X,
  CheckCircle2,
} from "lucide-react";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) {
          setCustomers(data.customers);
          if (data.customers.length > 0 && !newSub.customerId) {
            setNewSub((prev) => ({ ...prev, customerId: data.customers[0].id }));
          }
        }
      });

    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) {
          setPlans(data.plans);
          if (data.plans.length > 0 && !newSub.planId) {
            setNewSub((prev) => ({ ...prev, planId: data.plans[0].id }));
          }
        }
      });
  }, []);

  const handleAction = async (id: string, action: "pause" | "resume" | "renew" | "close") => {
    try {
      const res = await fetch(`/api/subscriptions/${id}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setFeedback(`Subscription ${action} action executed successfully.`);
        loadSubscriptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSub),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFeedback("New subscription provisioned successfully!");
        loadSubscriptions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const pausedCount = subscriptions.filter((s) => s.status === "paused").length;
  const closedCount = subscriptions.filter((s) => s.status === "closed").length;
  const totalValue = subscriptions.reduce((sum, s) => sum + (s.recurringAmount || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Feedback */}
      {feedback && (
        <div className="bg-[#E7E1B1] border border-[#C8D293] p-4 rounded-xl flex items-center justify-between text-xs text-[#0D530E]">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#306D29]" />
            <span className="font-medium">{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-semibold uppercase tracking-wider hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0D530E] tracking-tight font-normal">
            Subscriptions & Contracts
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Manage recurring contracts, plan tiers, billing cycles, and lifecycle transitions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] text-xs font-medium rounded-xl transition-all shadow-none self-start sm:self-auto tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>New subscription +</span>
        </button>
      </div>

      {/* Metrics Row: Clean thin vertical dividers matching Reference A */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 py-2 border-y border-[#D8D1A4]/60">
        <div className="pr-4 lg:pr-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Active contracts</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal flex items-baseline space-x-2">
            <span>{activeCount}</span>
            <span className="text-xs font-sans text-[#306D29] font-medium">● Operational</span>
          </div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Paused contracts</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {pausedCount}
          </div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Closed contracts</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {closedCount}
          </div>
        </div>

        <div className="pl-4 lg:pl-6">
          <div className="text-xs text-[#0D530E]/70 font-sans">Active Contract MRR</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {formatCurrency(totalValue)}
          </div>
        </div>
      </div>

      {/* Filters and Search Strip */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: `All (${subscriptions.length})` },
            { id: "active", label: `Active (${activeCount})` },
            { id: "paused", label: `Paused (${pausedCount})` },
            { id: "closed", label: `Closed (${closedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-sans rounded-lg transition-all ${
                statusFilter === tab.id
                  ? "bg-[#E7E1B1] text-[#0D530E] font-medium border border-[#C8D293]"
                  : "bg-transparent text-[#0D530E]/70 hover:bg-[#E7E1B1]/40 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input with thin border */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search customer, plan or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-sans bg-white/70 border border-[#D8D1A4] rounded-xl px-3 py-2 pl-9 text-[#0D530E] placeholder:text-[#0D530E]/40 focus:outline-none focus:border-[#0D530E]"
          />
          <Search className="w-4 h-4 text-[#0D530E]/50 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Subscriptions Ledger Table with Pale-Yellow Header (#E7E1B1) */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD] shadow-none">
        
        {/* Pale-Yellow Header Bar */}
        <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
          <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
            Active Subscription Contracts
          </h2>
          <span className="text-xs text-[#0D530E]/70 font-sans">
            Showing {subscriptions.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                <th className="py-3 px-6">Contract ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Plan Tier</th>
                <th className="py-3 px-6">Cadence</th>
                <th className="py-3 px-6 text-right">Recurring Value</th>
                <th className="py-3 px-6">Next Billing</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D1A4]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#0D530E]/60 font-sans">
                    Loading subscription records...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#0D530E]/60 font-sans">
                    No subscriptions found for the current query.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#0D530E]">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#0D530E]">{sub.customer?.companyName}</div>
                      <div className="text-[11px] text-[#0D530E]/60">{sub.customer?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-[#0D530E]">
                      {sub.plan?.name || "Custom Tier"}
                    </td>
                    <td className="py-4 px-6 font-sans text-[11px] capitalize text-[#0D530E]/70">
                      {sub.billingFrequency}
                    </td>
                    <td className="py-4 px-6 text-right font-serif text-sm font-normal text-[#0D530E]">
                      {formatCurrency(sub.recurringAmount)}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                      {new Date(sub.nextBillingDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          sub.status === "active"
                            ? "bg-[#E6F4EA] text-[#2E8540]"
                            : sub.status === "paused"
                            ? "bg-[#FEF7E0] text-[#B06000]"
                            : "bg-[#FCE8E6] text-[#C5221F]"
                        }`}
                      >
                        <span className="mr-1.5">●</span>
                        <span className="capitalize">{sub.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      {sub.status === "active" ? (
                        <button
                          onClick={() => handleAction(sub.id, "pause")}
                          className="px-2.5 py-1 text-xs border border-[#D8D1A4] rounded-lg hover:bg-[#E7E1B1]/50 text-[#0D530E] transition-all"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(sub.id, "resume")}
                          className="px-2.5 py-1 text-xs border border-[#306D29] bg-[#306D29]/10 text-[#0D530E] rounded-lg hover:bg-[#306D29]/20 transition-all font-medium"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(sub.id, "renew")}
                        className="px-2.5 py-1 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-lg transition-all font-medium"
                      >
                        Renew
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editorial Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-md w-full border border-[#D8D1A4] overflow-hidden shadow-2xl">
            {/* Modal Pale-Yellow Header */}
            <div className="bg-[#E7E1B1] px-6 py-4 flex justify-between items-center border-b border-[#D8D1A4]">
              <h3 className="font-serif text-lg text-[#0D530E] font-normal">
                Deploy New Subscription
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Customer Entity *
                </label>
                <select
                  required
                  value={newSub.customerId}
                  onChange={(e) => setNewSub({ ...newSub, customerId: e.target.value })}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Subscription Plan *
                </label>
                <select
                  required
                  value={newSub.planId}
                  onChange={(e) => setNewSub({ ...newSub, planId: e.target.value })}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.frequency}) — ₹{p.basePrice.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Frequency
                  </label>
                  <select
                    value={newSub.billingFrequency}
                    onChange={(e) => setNewSub({ ...newSub, billingFrequency: e.target.value })}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    License Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSub.quantity}
                    onChange={(e) => setNewSub({ ...newSub, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#D8D1A4]/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-[#0D530E]/70 hover:text-[#0D530E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl font-medium disabled:opacity-50 transition-all tracking-wide"
                >
                  {submitting ? "Deploying..." : "Confirm & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
