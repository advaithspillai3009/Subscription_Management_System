"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Check, Download, CreditCard, ShieldCheck } from "lucide-react";

interface CustomerProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  gstin?: string;
  address?: string;
  city?: string;
  subscriptions: {
    id: string;
    subscriptionNumber: string;
    status: string;
    billingFrequency: string;
    startDate: string;
    expiryDate: string;
    nextBillingDate: string;
    recurringAmount: number;
    plan: {
      name: string;
      description?: string;
    };
    lines: {
      id: string;
      quantity: number;
      product: { name: string };
      variant?: { variantName: string };
    }[];
  }[];
  invoices: {
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    taxAmount: number;
    lines: {
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalAmount: number;
    }[];
  }[];
  payments: {
    id: string;
    paymentNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    status: string;
    transactionReference?: string;
    invoice?: {
      invoiceNumber: string;
    };
  }[];
}

export default function CustomerPortalPage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"subscriptions" | "invoices" | "payments">("subscriptions");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/portal");
      const data = await res.json();
      if (data.success) {
        setProfile(data.customer);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[#0D530E]/60">
        Connecting to customer self-service portal...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center text-xs text-[#C5221F] bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-8 max-w-lg mx-auto">
        No active customer profile found. Please sign in as a customer account.
      </div>
    );
  }

  const activeSubs = profile.subscriptions.filter((s) => s.status === "active");
  const totalBilled = profile.invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = profile.invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Customer Header Banner */}
      <div className="border border-[#D8D1A4] rounded-2xl p-6 sm:p-8 bg-[#FBF5DD] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-sans bg-[#E7E1B1] text-[#0D530E] px-2.5 py-1 rounded-md font-semibold uppercase tracking-wider">
              Customer Self-Service Portal
            </span>
            <span className="text-xs text-[#0D530E]/60">
              Account: {profile.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0D530E] mt-2 font-normal">
            {profile.companyName}
          </h1>
          <p className="text-xs text-[#0D530E]/70 mt-1">
            Primary Contact: <span className="font-medium text-[#0D530E]">{profile.contactName}</span> ({profile.email})
            {profile.gstin && ` · GSTIN: ${profile.gstin}`}
          </p>
        </div>

        <div className="flex items-center space-x-6 bg-[#E7E1B1]/40 p-4 rounded-xl border border-[#D8D1A4] shrink-0">
          <div>
            <span className="text-[10px] text-[#0D530E]/70 uppercase font-semibold block">Active Plans</span>
            <span className="text-2xl font-serif text-[#0D530E] font-normal">{activeSubs.length}</span>
          </div>
          <div className="h-10 w-px bg-[#D8D1A4]"></div>
          <div>
            <span className="text-[10px] text-[#0D530E]/70 uppercase font-semibold block">Outstanding Due</span>
            <span className={`text-2xl font-serif font-normal ${outstanding > 0 ? "text-[#C5221F]" : "text-[#306D29]"}`}>
              {formatCurrency(outstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#D8D1A4]/60 pb-1">
        {[
          { id: "subscriptions", label: `My Subscriptions (${profile.subscriptions.length})` },
          { id: "invoices", label: `Invoices & Billing (${profile.invoices.length})` },
          { id: "payments", label: `Payment Receipts (${profile.payments.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-sans rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-[#E7E1B1] text-[#0D530E] font-medium border border-[#C8D293]"
                : "bg-transparent text-[#0D530E]/70 hover:bg-[#E7E1B1]/40 border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Subscriptions */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          {profile.subscriptions.length === 0 ? (
            <div className="border border-[#D8D1A4] bg-[#FBF5DD] p-8 text-center text-xs text-[#0D530E]/60 rounded-2xl">
              No active subscriptions found for this account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-6 space-y-4 hover:border-[#0D530E] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-[#0D530E]/60">
                        {sub.subscriptionNumber}
                      </span>
                      <h3 className="text-xl font-serif text-[#0D530E] mt-1 font-normal">
                        {sub.plan.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        sub.status === "active"
                          ? "bg-[#E6F4EA] text-[#2E8540]"
                          : "bg-[#FEF7E0] text-[#B06000]"
                      }`}
                    >
                      <span className="mr-1.5">●</span>
                      <span className="capitalize">{sub.status}</span>
                    </span>
                  </div>

                  <div className="bg-[#E7E1B1]/30 p-4 rounded-xl border border-[#D8D1A4] space-y-2 text-xs">
                    <div className="flex justify-between text-[#0D530E]">
                      <span className="text-[#0D530E]/70">Frequency:</span>
                      <span className="capitalize font-medium text-[#306D29]">{sub.billingFrequency}</span>
                    </div>
                    <div className="flex justify-between text-[#0D530E]">
                      <span className="text-[#0D530E]/70">Recurring Cost:</span>
                      <span className="font-serif text-sm">
                        {formatCurrency(sub.recurringAmount)} / {sub.billingFrequency}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#0D530E]">
                      <span className="text-[#0D530E]/70">Next Billing Date:</span>
                      <span>
                        {new Date(sub.nextBillingDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Invoices */}
      {activeTab === "invoices" && (
        <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
          <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
            <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
              Customer Invoices
            </h2>
            <span className="text-xs text-[#0D530E]/70 font-sans">
              {profile.invoices.length} invoices issued
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Issue Date</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6 text-right">Tax (18% GST)</th>
                  <th className="py-3 px-6 text-right">Total</th>
                  <th className="py-3 px-6 text-right">Paid</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D1A4]/60">
                {profile.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#0D530E]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                      {new Date(inv.issueDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                      {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-4 px-6 text-right font-serif text-[#0D530E]/70">
                      {formatCurrency(inv.taxAmount)}
                    </td>
                    <td className="py-4 px-6 text-right font-serif text-sm font-normal text-[#0D530E]">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-4 px-6 text-right font-serif text-[#306D29]">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          inv.status === "paid"
                            ? "bg-[#E6F4EA] text-[#2E8540]"
                            : "bg-[#FEF7E0] text-[#B06000]"
                        }`}
                      >
                        <span className="mr-1.5">●</span>
                        <span className="capitalize">{inv.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 text-xs border border-[#D8D1A4] rounded-lg hover:bg-[#E7E1B1]/50 text-[#0D530E] transition-all"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payments */}
      {activeTab === "payments" && (
        <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
          <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
            <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
              Verified Payment Receipts
            </h2>
            <span className="text-xs text-[#0D530E]/70 font-sans">
              {profile.payments.length} transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                  <th className="py-3 px-6">Payment #</th>
                  <th className="py-3 px-6">Settlement Date</th>
                  <th className="py-3 px-6">Payment Method</th>
                  <th className="py-3 px-6">Reference / UTR</th>
                  <th className="py-3 px-6 text-right">Settled Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D1A4]/60">
                {profile.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#0D530E]">
                      {p.paymentNumber}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-4 px-6 capitalize text-[#0D530E]/70">
                      {p.paymentMethod.replace("_", " ")}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[#0D530E]/60">
                      {p.transactionReference || "AUTO-VERIFIED"}
                    </td>
                    <td className="py-4 px-6 text-right font-serif text-sm text-[#306D29]">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6F4EA] text-[#2E8540]">
                        <span className="mr-1.5">●</span>
                        <span className="capitalize">{p.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal for Customer */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D8D1A4] p-7 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[#D8D1A4] pb-4">
              <div>
                <span className="text-[10px] font-sans bg-[#E7E1B1] text-[#0D530E] px-2.5 py-1 rounded-md uppercase font-semibold">
                  TAX INVOICE · GST 18%
                </span>
                <h3 className="text-2xl font-serif text-[#0D530E] mt-2 font-normal">
                  {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <div className="border border-[#D8D1A4] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#E7E1B1] text-[#0D530E] text-[11px] font-medium uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D1A4]/60">
                  {selectedInvoice.lines?.map((line: any) => (
                    <tr key={line.id} className="text-[#0D530E]">
                      <td className="p-3 font-medium">{line.description}</td>
                      <td className="p-3 text-center font-mono">{line.quantity}</td>
                      <td className="p-3 text-right font-serif">{formatCurrency(line.unitPrice)}</td>
                      <td className="p-3 text-right font-serif font-medium">{formatCurrency(line.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#D8D1A4]">
              <div className="font-serif text-lg text-[#0D530E]">
                Total: {formatCurrency(selectedInvoice.totalAmount)}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl text-xs font-medium transition-all"
                >
                  Print / Download PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 border border-[#D8D1A4] rounded-xl text-xs text-[#0D530E]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
