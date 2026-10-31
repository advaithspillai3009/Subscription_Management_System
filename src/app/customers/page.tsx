"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";

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
    } catch (err) {
      setFeedback({ type: "error", text: "Network communication error." });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter customers at risk (those with overdue unpaid invoices)
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
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-md border text-xs font-mono flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-[#E6F2F0] border-[#2F7D72] text-[#2F7D72]"
              : "bg-red-50 border-red-300 text-[#D9383A]"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="font-bold hover:opacity-75 uppercase text-[10px]"
          >
            [ Dismiss ]
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Total Accounts
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] mt-1 block">
            {totalClients}
          </span>
          <span className="text-[10px] text-[#5D6B6C] mt-1 block">
            B2B Enterprise Entities
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Active Subscriptions
          </span>
          <span className="text-2xl font-bold font-mono text-[#2F7D72] mt-1 block">
            {activeSubsAcrossAll}
          </span>
          <span className="text-[10px] text-[#2F7D72] mt-1 block">
            Live recurring contracts
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Cumulative Invoiced
          </span>
          <span className="text-2xl font-bold font-mono text-[#2E8540] mt-1 block">
            {formatCurrency(totalBilledValue)}
          </span>
          <span className="text-[10px] text-[#2E8540] mt-1 block">
            Total lifecycle billings
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            At-Risk Accounts
          </span>
          <span className="text-2xl font-bold font-mono text-[#D9383A] mt-1 block">
            {atRiskCount}
          </span>
          <span className="text-[10px] text-[#D9383A] mt-1 block">
            Past due payment risk
          </span>
        </div>
      </div>

      {/* Control Bar: Filter, Search & Add Customer */}
      <div className="bg-white p-4 border border-[#E1E6E3] rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterAtRisk(false)}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              !filterAtRisk
                ? "bg-[#2F7D72] text-white font-medium"
                : "bg-[#F3F4F3] text-[#5D6B6C] hover:bg-[#E1E6E3]"
            }`}
          >
            All Accounts ({customers.length})
          </button>
          <button
            onClick={() => setFilterAtRisk(true)}
            className={`px-3 py-1.5 text-xs font-mono uppercase rounded transition-colors ${
              filterAtRisk
                ? "bg-[#D9383A] text-white font-medium"
                : "bg-[#F3F4F3] text-[#5D6B6C] hover:bg-[#E1E6E3]"
            }`}
          >
            At-Risk Accounts ({atRiskCount})
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search company, contact, GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded px-3 py-1.5 pl-8 text-[#12191A] focus:outline-none focus:border-[#2F7D72] w-64"
            />
            <span className="absolute left-2.5 top-2 text-xs text-[#5D6B6C]">🔍</span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 text-xs font-mono bg-[#12191A] hover:bg-[#2C3536] text-white rounded font-medium flex items-center space-x-1"
          >
            <span>+</span>
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E1E6E3] rounded-md overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#E1E6E3] flex justify-between items-center bg-[#F8FAF9]">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#12191A]">
            Enterprise Client Directory
          </h2>
          <span className="text-[10px] font-mono text-[#5D6B6C]">
            DISPLAYING: {displayedCustomers.length} ACCOUNTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E1E6E3] bg-[#F8FAF9] text-[10px] font-mono text-[#5D6B6C] uppercase">
                <th className="py-2.5 px-4">Company Name</th>
                <th className="py-2.5 px-4">Contact Person</th>
                <th className="py-2.5 px-4">GSTIN & Location</th>
                <th className="py-2.5 px-4 text-center">Active Subs</th>
                <th className="py-2.5 px-4 text-right">Lifetime Billed</th>
                <th className="py-2.5 px-4 text-center">Risk Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-mono text-[#5D6B6C]">
                    Querying enterprise accounts...
                  </td>
                </tr>
              ) : displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-mono text-[#5D6B6C]">
                    No customer accounts found.
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((c) => {
                  const activeSubs = c.subscriptions.filter((s) => s.status === "active").length;
                  const totalSpent = c.invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
                  const hasOverdue = c.invoices.some(
                    (inv) =>
                      inv.status !== "paid" &&
                      inv.status !== "cancelled" &&
                      new Date(inv.dueDate) < new Date()
                  );

                  return (
                    <tr key={c.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#12191A]">
                        {c.companyName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#12191A]">{c.contactName}</div>
                        <div className="text-[10px] text-[#5D6B6C]">{c.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-[#12191A]">
                          {c.gstin || "Non-GST Registered"}
                        </div>
                        <div className="text-[10px] text-[#5D6B6C]">
                          {c.city ? `${c.city}, ${c.state || "India"}` : "India"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            activeSubs > 0 ? "bg-[#E6F2F0] text-[#2F7D72]" : "bg-gray-100 text-[#5D6B6C]"
                          }`}
                        >
                          {activeSubs}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#12191A]">
                        {formatCurrency(totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hasOverdue ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-red-100 text-[#D9383A] font-semibold">
                            ⚠️ AT RISK
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-green-100 text-[#2E8540] font-semibold">
                            HEALTHY
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 text-[11px] font-mono bg-[#F3F4F3] hover:bg-[#E1E6E3] text-[#12191A] rounded"
                        >
                          Customer 360°
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

      {/* Customer 360° Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E1E6E3] p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-[#E1E6E3] pb-4">
              <div>
                <span className="text-[10px] font-mono bg-[#E6F2F0] text-[#2F7D72] px-2 py-0.5 rounded uppercase font-semibold">
                  CUSTOMER 360° DOSSIER
                </span>
                <h3 className="text-xl font-bold font-mono text-[#12191A] mt-2">
                  {selectedCustomer.companyName}
                </h3>
                <p className="text-xs text-[#5D6B6C]">
                  Contact: {selectedCustomer.contactName} ({selectedCustomer.email}) · Phone:{" "}
                  {selectedCustomer.phone || "N/A"}
                </p>
                <p className="text-xs text-[#5D6B6C]">
                  GSTIN: {selectedCustomer.gstin || "None"} · Location: {selectedCustomer.city},{" "}
                  {selectedCustomer.state} {selectedCustomer.pincode}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            {/* Subscriptions Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-[#12191A] tracking-wider">
                Active & Past Subscriptions ({selectedCustomer.subscriptions.length})
              </h4>
              {selectedCustomer.subscriptions.length === 0 ? (
                <p className="text-xs text-[#5D6B6C] italic font-mono bg-[#F8FAF9] p-3 rounded">
                  No subscriptions recorded for this account.
                </p>
              ) : (
                <div className="border border-[#E1E6E3] rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F3F4F3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                      <tr>
                        <th className="p-2">Sub #</th>
                        <th className="p-2">Plan</th>
                        <th className="p-2">Cadence</th>
                        <th className="p-2 text-right">Amount</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E6E3]">
                      {selectedCustomer.subscriptions.map((s) => (
                        <tr key={s.id} className="hover:bg-[#F8FAF9]">
                          <td className="p-2 font-mono font-semibold">{s.subscriptionNumber}</td>
                          <td className="p-2">{s.plan?.name}</td>
                          <td className="p-2 font-mono text-[10px] uppercase text-[#5D6B6C]">
                            {s.billingFrequency}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            {formatCurrency(s.recurringAmount)}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                s.status === "active"
                                  ? "bg-green-100 text-[#2E8540]"
                                  : "bg-gray-100 text-[#5D6B6C]"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Invoices Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase text-[#12191A] tracking-wider">
                Billing Invoices ({selectedCustomer.invoices.length})
              </h4>
              {selectedCustomer.invoices.length === 0 ? (
                <p className="text-xs text-[#5D6B6C] italic font-mono bg-[#F8FAF9] p-3 rounded">
                  No invoices issued yet.
                </p>
              ) : (
                <div className="border border-[#E1E6E3] rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F3F4F3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                      <tr>
                        <th className="p-2">Invoice #</th>
                        <th className="p-2">Due Date</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-right">Paid</th>
                        <th className="p-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E6E3]">
                      {selectedCustomer.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-[#F8FAF9]">
                          <td className="p-2 font-mono font-semibold">{inv.invoiceNumber}</td>
                          <td className="p-2 font-mono text-[11px] text-[#5D6B6C]">
                            {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">
                            {formatCurrency(inv.totalAmount)}
                          </td>
                          <td className="p-2 text-right font-mono text-[#2E8540]">
                            {formatCurrency(inv.paidAmount)}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                                inv.status === "paid"
                                  ? "bg-green-100 text-[#2E8540]"
                                  : "bg-amber-100 text-[#D97706]"
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

            <div className="flex justify-end pt-4 border-t border-[#E1E6E3]">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 text-xs font-mono bg-[#F3F4F3] border border-[#E1E6E3] rounded hover:bg-[#E1E6E3]"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-sm font-mono font-bold text-[#12191A] uppercase">
                Register New Enterprise Customer
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    GSTIN (15 Digits)
                  </label>
                  <input
                    type="text"
                    placeholder="29AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                  Billing Street Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E1E6E3]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 font-mono text-[#5D6B6C] hover:text-[#12191A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 font-mono bg-[#2F7D72] text-white rounded hover:bg-[#26665D] font-medium disabled:opacity-50"
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
