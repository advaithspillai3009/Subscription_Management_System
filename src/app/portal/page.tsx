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
      <div className="py-16 text-center text-xs text-[#5D6B6C]">
        Connecting to customer self-service portal...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center text-xs text-[#D9383A] bg-white border border-[#E1E6E3] rounded-lg p-8">
        No customer profile located. Please log in with a customer account or register.
      </div>
    );
  }

  const activeSubs = profile.subscriptions.filter((s) => s.status === "active");
  const totalBilled = profile.invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = profile.invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div className="space-y-6">
      {/* Customer Header Banner */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono bg-[#E6F2F0] text-[#2F7D72] px-2.5 py-0.5 rounded font-semibold uppercase">
              CUSTOMER SELF-SERVICE PORTAL
            </span>
            <span className="text-xs text-[#5D6B6C]">
              Account ID: {profile.id.slice(0, 8)}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-[#12191A] mt-2">
            {profile.companyName}
          </h2>
          <p className="text-xs text-[#5D6B6C] mt-0.5">
            Primary Contact: <span className="text-[#12191A] font-semibold">{profile.contactName}</span> ({profile.email})
            {profile.gstin && ` · GSTIN: ${profile.gstin}`}
          </p>
        </div>

        <div className="flex items-center space-x-6 bg-[#F8FAF9] p-4 rounded-lg border border-[#E1E6E3]">
          <div>
            <span className="text-[10px] text-[#5D6B6C] uppercase font-bold block">Active Plans</span>
            <span className="text-2xl font-bold font-mono text-[#2F7D72]">{activeSubs.length}</span>
          </div>
          <div className="h-10 w-px bg-[#E1E6E3]"></div>
          <div>
            <span className="text-[10px] text-[#5D6B6C] uppercase font-bold block">Outstanding Due</span>
            <span className={`text-2xl font-bold font-mono ${outstanding > 0 ? "text-[#D97706]" : "text-[#2E8540]"}`}>
              {formatCurrency(outstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs with Proper Spacing */}
      <div className="flex border-b border-[#E1E6E3] space-x-8">
        {[
          { id: "subscriptions", label: `My Subscriptions (${profile.subscriptions.length})` },
          { id: "invoices", label: `Invoices & Billing (${profile.invoices.length})` },
          { id: "payments", label: `Payment Receipts (${profile.payments.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs uppercase font-medium tracking-wider transition-all border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? "border-[#2F7D72] text-[#2F7D72] font-bold"
                : "border-transparent text-[#5D6B6C] hover:text-[#12191A]"
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
            <div className="bg-white border border-[#E1E6E3] p-8 text-center text-xs text-[#5D6B6C] rounded-lg">
              No active subscriptions found for this account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white border border-[#E1E6E3] rounded-lg p-6 shadow-xs space-y-4 hover:border-[#2F7D72] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-[#5D6B6C]">
                        {sub.subscriptionNumber}
                      </span>
                      <h3 className="text-base font-bold text-[#12191A] mt-1">
                        {sub.plan.name}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        sub.status === "active"
                          ? "bg-green-50 text-[#2E8540] border border-green-200"
                          : "bg-gray-100 text-[#5D6B6C]"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="bg-[#F8FAF9] p-4 rounded-lg border border-[#E1E6E3] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-[#5D6B6C]">Frequency:</span>
                      <span className="uppercase text-[#2F7D72] font-bold">{sub.billingFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6B6C]">Recurring Cost:</span>
                      <span className="font-bold text-[#12191A]">
                        {formatCurrency(sub.recurringAmount)} / {sub.billingFrequency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6B6C]">Next Billing:</span>
                      <span>
                        {new Date(sub.nextBillingDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5D6B6C]">Term Expiry:</span>
                      <span>
                        {new Date(sub.expiryDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {sub.lines.length > 0 && (
                    <div className="text-xs text-[#5D6B6C] space-y-1">
                      <span className="text-[10px] font-bold uppercase block text-[#12191A]">Provisioned Services:</span>
                      {sub.lines.map((ln) => (
                        <div key={ln.id} className="flex justify-between">
                          <span>
                            • {ln.product.name} {ln.variant ? `(${ln.variant.variantName})` : ""}
                          </span>
                          <span className="font-mono">Qty: {ln.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Invoices with Proper Spacing */}
      {activeTab === "invoices" && (
        <div className="bg-white border border-[#E1E6E3] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <tr>
                  <th className="py-3.5 px-6">Invoice #</th>
                  <th className="py-3.5 px-6">Issue Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6 text-right">Tax (18% GST)</th>
                  <th className="py-3.5 px-6 text-right">Total Invoiced</th>
                  <th className="py-3.5 px-6 text-right">Balance Due</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E6E3]">
                {profile.invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#5D6B6C]">
                      No invoices issued yet.
                    </td>
                  </tr>
                ) : (
                  profile.invoices.map((inv) => {
                    const balance = inv.totalAmount - inv.paidAmount;
                    return (
                      <tr key={inv.id} className="hover:bg-[#F8FAF9]">
                        <td className="py-4 px-6 font-mono font-bold text-[#12191A]">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">
                          {new Date(inv.issueDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">
                          {new Date(inv.dueDate).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-4 px-6 text-right font-mono text-[#5D6B6C]">
                          {formatCurrency(inv.taxAmount)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-[#12191A] text-sm">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-semibold">
                          <span className={balance > 0 ? "text-[#D97706]" : "text-[#2E8540]"}>
                            {formatCurrency(balance)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              inv.status === "paid"
                                ? "bg-green-50 text-[#2E8540] border border-green-200"
                                : inv.status === "confirmed"
                                ? "bg-blue-50 text-[#2563EB] border border-blue-200"
                                : "bg-amber-50 text-[#D97706] border border-amber-200"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-3 py-1 text-[11px] font-medium bg-[#F8FAF9] hover:bg-[#E1E6E3] text-[#12191A] rounded-md border border-[#E1E6E3] transition-colors"
                          >
                            View / PDF
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
      )}

      {/* Tab: Payments */}
      {activeTab === "payments" && (
        <div className="bg-white border border-[#E1E6E3] rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <tr>
                  <th className="py-3.5 px-6">Receipt #</th>
                  <th className="py-3.5 px-6">Payment Date</th>
                  <th className="py-3.5 px-6">Invoice Ref</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6">Transaction UTR</th>
                  <th className="py-3.5 px-6 text-right">Amount Paid</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E6E3]">
                {profile.payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#5D6B6C]">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  profile.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F8FAF9]">
                      <td className="py-4 px-6 font-mono font-bold text-[#12191A]">
                        {p.paymentNumber}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-[#2F7D72] font-semibold">
                        {p.invoice?.invoiceNumber || "N/A"}
                      </td>
                      <td className="py-4 px-6 font-mono uppercase text-[11px] font-semibold">
                        {p.paymentMethod.replace("_", " ")}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">
                        {p.transactionReference || "Direct Ledger"}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#2E8540] text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-green-50 text-[#2E8540] border border-green-200 font-semibold">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice PDF Printable Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E1E6E3] p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-[#E1E6E3] pb-4">
              <div>
                <span className="text-[10px] font-mono bg-[#E6F2F0] text-[#2F7D72] px-2 py-0.5 rounded uppercase font-semibold">
                  TAX INVOICE · GST 18% RECONCILED
                </span>
                <h3 className="text-xl font-bold font-mono text-[#12191A] mt-2">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-[#5D6B6C]">
                  Date: {new Date(selectedInvoice.issueDate).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#F8FAF9] p-4 rounded-lg border border-[#E1E6E3]">
              <div>
                <span className="text-[10px] text-[#5D6B6C] uppercase font-bold block">Supplier</span>
                <p className="font-bold text-[#12191A] mt-1">BRIGHTLOOP TECHNOLOGIES PVT LTD</p>
                <p className="text-[#5D6B6C]">GSTIN: 29AAACB1234F1Z8</p>
              </div>
              <div>
                <span className="text-[10px] text-[#5D6B6C] uppercase font-bold block">Customer</span>
                <p className="font-bold text-[#12191A] mt-1">{profile.companyName}</p>
                <p className="text-[#5D6B6C]">GSTIN: {profile.gstin || "Unregistered"}</p>
              </div>
            </div>

            <div className="border border-[#E1E6E3] rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAF9] font-mono text-[10px] text-[#5D6B6C] uppercase">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E6E3]">
                  {selectedInvoice.lines.map((ln: any) => (
                    <tr key={ln.id}>
                      <td className="p-3 font-medium">{ln.description}</td>
                      <td className="p-3 text-right font-mono">{ln.quantity}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(ln.unitPrice)}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatCurrency(ln.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end font-mono text-xs">
              <div className="w-56 space-y-1.5">
                <div className="flex justify-between text-[#5D6B6C]">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#12191A] border-t border-[#E1E6E3] pt-1.5">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E1E6E3]">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs bg-[#2F7D72] text-white rounded-md hover:bg-[#26665D] font-medium"
              >
                Print / Download PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded-md hover:bg-[#E1E6E3]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
