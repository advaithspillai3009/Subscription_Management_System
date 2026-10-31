"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
        setFeedback(`Subscription state updated successfully.`);
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

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="bg-[#E6F2F0] border border-[#2F7D72] p-4 rounded-md flex items-center justify-between text-xs text-[#2F7D72]">
          <span className="font-semibold">{feedback}</span>
          <button onClick={() => setFeedback(null)} className="font-bold hover:opacity-75 uppercase text-[10px]">
            [ Dismiss ]
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1E6E3]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#12191A] tracking-tight">
            Subscriptions & Contracts
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Manage recurring contracts, plan tiers, billing frequencies, and customer lifecycle transitions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#2F7D72] hover:bg-[#26665D] text-white text-xs font-medium rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription</span>
        </button>
      </div>

      {/* Control Bar: Status Tabs + Search with generous spacing */}
      <div className="bg-white border border-[#E1E6E3] p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {[
            { id: "all", label: `All (${subscriptions.length})` },
            { id: "active", label: `Active (${activeCount})` },
            { id: "paused", label: `Paused (${pausedCount})` },
            { id: "closed", label: `Closed (${closedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#2F7D72] text-white"
                  : "bg-[#F8FAF9] text-[#5D6B6C] hover:text-[#12191A] border border-[#E1E6E3]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by customer, plan or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded-md px-3 py-2 pl-9 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
          />
          <Search className="w-4 h-4 text-[#5D6B6C] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Subscriptions Ledger Table */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <th className="py-3.5 px-6">Contract ID</th>
                <th className="py-3.5 px-6">Customer Organization</th>
                <th className="py-3.5 px-6">Assigned Plan</th>
                <th className="py-3.5 px-6">Billing Frequency</th>
                <th className="py-3.5 px-6 text-right">Recurring Value</th>
                <th className="py-3.5 px-6">Next Billing Date</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5D6B6C]">
                    Loading subscription records...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5D6B6C]">
                    No subscriptions matching the filter criteria.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#12191A]">
                      {sub.subscriptionNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#12191A]">{sub.customer?.companyName}</div>
                      <div className="text-[11px] text-[#5D6B6C]">{sub.customer?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-[#12191A]">
                      {sub.plan?.name || "Custom Tier"}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] uppercase text-[#2F7D72]">
                      {sub.billingFrequency}
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
                            : sub.status === "paused"
                            ? "bg-amber-50 text-[#D97706] border border-amber-200"
                            : "bg-gray-100 text-[#5D6B6C]"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      {sub.status === "active" ? (
                        <button
                          onClick={() => handleAction(sub.id, "pause")}
                          className="px-2.5 py-1 text-[11px] font-mono bg-[#F8FAF9] hover:bg-amber-50 hover:text-[#D97706] border border-[#E1E6E3] rounded transition-colors"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(sub.id, "resume")}
                          className="px-2.5 py-1 text-[11px] font-mono bg-[#F8FAF9] hover:bg-green-50 hover:text-[#2E8540] border border-[#E1E6E3] rounded transition-colors"
                        >
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(sub.id, "renew")}
                        className="px-2.5 py-1 text-[11px] font-mono bg-[#E6F2F0] hover:bg-[#2F7D72] hover:text-white text-[#2F7D72] rounded transition-colors font-semibold"
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

      {/* Clean Create Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E1E6E3] p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-base font-bold text-[#12191A]">
                Deploy New Subscription
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Customer Entity *
                </label>
                <select
                  required
                  value={newSub.customerId}
                  onChange={(e) => setNewSub({ ...newSub, customerId: e.target.value })}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Subscription Plan *
                </label>
                <select
                  required
                  value={newSub.planId}
                  onChange={(e) => setNewSub({ ...newSub, planId: e.target.value })}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
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
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Frequency
                  </label>
                  <select
                    value={newSub.billingFrequency}
                    onChange={(e) => setNewSub({ ...newSub, billingFrequency: e.target.value })}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    License Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSub.quantity}
                    onChange={(e) => setNewSub({ ...newSub, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E1E6E3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#5D6B6C] hover:text-[#12191A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs bg-[#2F7D72] hover:bg-[#26665D] text-white rounded-md font-medium disabled:opacity-50"
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
