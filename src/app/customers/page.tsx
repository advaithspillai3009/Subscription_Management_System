"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Search, Plus, User, Building, ExternalLink, CheckCircle2 } from "lucide-react";

interface CustomerRecord {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  createdAt: string;
  subscriptions: {
    id: string;
    subscriptionNumber: string;
    status: string;
    recurringAmount: number;
    billingFrequency: string;
    plan: { name: string };
  }[];
  invoices: {
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    dueDate: string;
  }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAtRisk, setFilterAtRisk] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    gstin: "",
    address: "",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    country: "India",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Customer ${data.customer.companyName} registered successfully!`,
        });
        setIsAddModalOpen(false);
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          gstin: "",
          address: "",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          country: "India",
        });
        fetchCustomers();
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to create customer." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network communication error." });
    } finally {
      setSubmitting(false);
    }
  };

  const displayedCustomers = filterAtRisk
    ? customers.filter((c) =>
        c.invoices.some(
          (inv) =>
            inv.status !== "paid" &&
            inv.status !== "cancelled" &&
            new Date(inv.dueDate) < new Date()
        )
      )
    : customers;

  const totalClients = customers.length;
  const activeSubsAcrossAll = customers.reduce(
    (acc, c) => acc + c.subscriptions.filter((s) => s.status === "active").length,
    0
  );
  const totalBilledValue = customers.reduce(
    (acc, c) => acc + c.invoices.reduce((iacc, inv) => iacc + inv.totalAmount, 0),
    0
  );
  const atRiskCount = customers.filter((c) =>
    c.invoices.some(
      (inv) =>
        inv.status !== "paid" &&
        inv.status !== "cancelled" &&
        new Date(inv.dueDate) < new Date()
    )
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-[#E7E1B1] border-[#C8D293] text-[#0D530E]"
              : "bg-red-100/70 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#306D29]" />
            <span className="font-medium">{feedback.text}</span>
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
            Customer Organizations
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Directory of corporate subscriber accounts, GSTIN profiles, active contracts, and 360° dossiers.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] text-xs font-medium rounded-xl transition-all shadow-none self-start sm:self-auto tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>New customer +</span>
        </button>
      </div>

      {/* Metrics Row: Thin vertical dividers matching Reference A */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 py-2 border-y border-[#D8D1A4]/60">
        <div className="pr-4 lg:pr-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Registered Accounts</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {totalClients}
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Enterprise subscriber entities</div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Active Subscriptions</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#306D29] mt-1 font-normal">
            {activeSubsAcrossAll}
          </div>
          <div className="text-[11px] text-[#306D29] mt-0.5">Live contracts running</div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Lifetime Invoiced</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {formatCurrency(totalBilledValue)}
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Across all historical cycles</div>
        </div>

        <div className="pl-4 lg:pl-6">
          <div className="text-xs text-[#0D530E]/70 font-sans">At-Risk Accounts</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#C5221F] mt-1 font-normal">
            {atRiskCount}
          </div>
          <div className="text-[11px] text-[#C5221F] mt-0.5">Pending overdue balance</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterAtRisk(!filterAtRisk)}
            className={`px-3.5 py-1.5 text-xs font-sans rounded-lg transition-all ${
              filterAtRisk
                ? "bg-[#FEF7E0] text-[#B06000] border border-[#E7E1B1] font-medium"
                : "bg-transparent text-[#0D530E]/70 hover:bg-[#E7E1B1]/40 border border-[#D8D1A4]"
            }`}
          >
            {filterAtRisk ? "Showing: At-Risk Only" : "Filter: All Customers"}
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search company, contact, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans bg-white/70 border border-[#D8D1A4] rounded-xl px-3 py-2 pl-9 text-[#0D530E] placeholder:text-[#0D530E]/40 focus:outline-none focus:border-[#0D530E]"
          />
          <Search className="w-4 h-4 text-[#0D530E]/50 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table with Pale-Yellow Header (#E7E1B1) */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
        <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
          <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
            Customer Organizations Directory
          </h2>
          <span className="text-xs text-[#0D530E]/70 font-sans">
            {displayedCustomers.length} entities listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                <th className="py-3 px-6">Company / Organization</th>
                <th className="py-3 px-6">Primary Contact</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6 text-center">Active Contracts</th>
                <th className="py-3 px-6 text-right">Lifetime Billed</th>
                <th className="py-3 px-6 text-center">Health Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D1A4]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#0D530E]/60">
                    Loading customer directory...
                  </td>
                </tr>
              ) : displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#0D530E]/60">
                    No customer accounts matching query.
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((cust) => {
                  const activeSubs = cust.subscriptions.filter((s) => s.status === "active").length;
                  const hasOverdue = cust.invoices.some(
                    (inv) =>
                      inv.status !== "paid" &&
                      inv.status !== "cancelled" &&
                      new Date(inv.dueDate) < new Date()
                  );
                  const lifetimeSpent = cust.invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

                  return (
                    <tr key={cust.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#0D530E]">{cust.companyName}</div>
                        <div className="text-[11px] text-[#0D530E]/60 font-mono">
                          {cust.gstin ? `GST: ${cust.gstin}` : "GST: Unregistered"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#0D530E]">{cust.contactName}</div>
                        <div className="text-[11px] text-[#0D530E]/60">{cust.email}</div>
                      </td>
                      <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                        {cust.city || "Bangalore"}, {cust.state || "KA"}
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-medium text-[#0D530E]">
                        {activeSubs}
                      </td>
                      <td className="py-4 px-6 text-right font-serif text-sm text-[#0D530E]">
                        {formatCurrency(lifetimeSpent)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            hasOverdue
                              ? "bg-[#FCE8E6] text-[#C5221F]"
                              : activeSubs > 0
                              ? "bg-[#E6F4EA] text-[#2E8540]"
                              : "bg-[#FEF7E0] text-[#B06000]"
                          }`}
                        >
                          <span className="mr-1.5">●</span>
                          <span>{hasOverdue ? "Overdue" : activeSubs > 0 ? "Active" : "Prospect"}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-3 py-1.5 text-xs border border-[#D8D1A4] rounded-lg hover:bg-[#E7E1B1]/50 text-[#0D530E] font-medium transition-all"
                        >
                          360° Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360° Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D8D1A4] p-7 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[#D8D1A4] pb-4">
              <div>
                <span className="text-[10px] font-sans bg-[#E7E1B1] text-[#0D530E] px-2.5 py-1 rounded-md uppercase font-semibold">
                  Customer 360° Dossier
                </span>
                <h3 className="text-2xl font-serif text-[#0D530E] mt-2 font-normal">
                  {selectedCustomer.companyName}
                </h3>
                <p className="text-xs text-[#0D530E]/65 mt-0.5">
                  Contact: {selectedCustomer.contactName} ({selectedCustomer.email})
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 text-lg font-mono"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#E7E1B1]/30 p-4 rounded-xl border border-[#D8D1A4]">
                <span className="text-[10px] font-semibold uppercase text-[#0D530E]/60 block mb-1">
                  Tax & Address Profile
                </span>
                <div className="text-[11px] text-[#0D530E]">GSTIN: {selectedCustomer.gstin || "N/A"}</div>
                <div className="text-[11px] text-[#0D530E] mt-1">{selectedCustomer.address || "100 Outer Ring Road"}</div>
                <div className="text-[11px] text-[#0D530E]">
                  {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.pincode}
                </div>
              </div>

              <div className="bg-[#E7E1B1]/30 p-4 rounded-xl border border-[#D8D1A4]">
                <span className="text-[10px] font-semibold uppercase text-[#0D530E]/60 block mb-1">
                  Contract Status
                </span>
                <div className="text-[11px] text-[#0D530E]">
                  Active Subscriptions: {selectedCustomer.subscriptions.filter((s) => s.status === "active").length}
                </div>
                <div className="text-[11px] text-[#0D530E] mt-1">
                  Total Invoices Issued: {selectedCustomer.invoices.length}
                </div>
              </div>
            </div>

            {/* Subscriptions History */}
            <div className="space-y-3">
              <h4 className="font-serif text-base text-[#0D530E]">
                Active Subscriptions ({selectedCustomer.subscriptions.length})
              </h4>
              {selectedCustomer.subscriptions.length === 0 ? (
                <p className="text-xs text-[#0D530E]/60 bg-[#E7E1B1]/20 p-3 rounded-xl border border-[#D8D1A4]">
                  No active contracts provisioned for this account.
                </p>
              ) : (
                <div className="border border-[#D8D1A4] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#E7E1B1] text-[#0D530E] text-[11px] font-medium uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Contract #</th>
                        <th className="p-3">Plan Tier</th>
                        <th className="p-3">Cadence</th>
                        <th className="p-3 text-right">Value</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D1A4]/60">
                      {selectedCustomer.subscriptions.map((sub) => (
                        <tr key={sub.id} className="text-[#0D530E]">
                          <td className="p-3 font-mono font-medium">{sub.subscriptionNumber}</td>
                          <td className="p-3 font-medium">{sub.plan.name}</td>
                          <td className="p-3 capitalize">{sub.billingFrequency}</td>
                          <td className="p-3 text-right font-serif">{formatCurrency(sub.recurringAmount)}</td>
                          <td className="p-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-[#E6F4EA] text-[#2E8540]">
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Invoices History */}
            <div className="space-y-3">
              <h4 className="font-serif text-base text-[#0D530E]">
                Invoice Ledger ({selectedCustomer.invoices.length})
              </h4>
              {selectedCustomer.invoices.length === 0 ? (
                <p className="text-xs text-[#0D530E]/60 bg-[#E7E1B1]/20 p-3 rounded-xl border border-[#D8D1A4]">
                  No invoices generated yet.
                </p>
              ) : (
                <div className="border border-[#D8D1A4] rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#E7E1B1] text-[#0D530E] text-[11px] font-medium uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Invoice #</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3 text-right">Total</th>
                        <th className="p-3 text-right">Settled</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D1A4]/60">
                      {selectedCustomer.invoices.map((inv) => (
                        <tr key={inv.id} className="text-[#0D530E]">
                          <td className="p-3 font-mono font-medium">{inv.invoiceNumber}</td>
                          <td className="p-3 text-[11px]">
                            {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-3 text-right font-serif">{formatCurrency(inv.totalAmount)}</td>
                          <td className="p-3 text-right font-serif text-[#306D29]">
                            {formatCurrency(inv.paidAmount)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] ${
                                inv.status === "paid"
                                  ? "bg-[#E6F4EA] text-[#2E8540]"
                                  : "bg-[#FEF7E0] text-[#B06000]"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#D8D1A4]">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-medium border border-[#D8D1A4] rounded-xl hover:bg-[#E7E1B1]/40 text-[#0D530E]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-lg w-full border border-[#D8D1A4] overflow-hidden shadow-2xl">
            <div className="bg-[#E7E1B1] px-6 py-4 flex justify-between items-center border-b border-[#D8D1A4]">
              <h3 className="font-serif text-lg text-[#0D530E] font-normal">
                Register Customer Organization
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    placeholder="29AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-mono border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Billing Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#D8D1A4]/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#0D530E]/70 hover:text-[#0D530E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl font-medium disabled:opacity-50 transition-all tracking-wide"
                >
                  {submitting ? "Registering..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
