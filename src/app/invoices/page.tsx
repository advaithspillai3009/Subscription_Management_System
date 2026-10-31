"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/tax";
import { Search, Printer, Check, AlertCircle, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  totalAmount: number;
  product?: { name: string; sku: string };
  variant?: { variantName: string; priceAdjustment: number };
}

interface Payment {
  id: string;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  subscriptionId?: string;
  issueDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  customer: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    gstin?: string;
  };
  subscription?: {
    subscriptionNumber: string;
    billingFrequency: string;
  };
  lines: InvoiceLine[];
  payments: Payment[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("bank_transfer");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, searchQuery]);

  const handleStatusUpdate = async (id: string, action: "confirm" | "cancel") => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: "success",
          text: `Invoice status updated to ${action === "confirm" ? "confirmed" : "cancelled"}.`,
        });
        fetchInvoices();
        if (selectedInvoice && selectedInvoice.id === id) {
          setSelectedInvoice({ ...selectedInvoice, status: action === "confirm" ? "confirmed" : "cancelled" });
        }
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Action failed." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error occurred." });
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      setSubmittingPayment(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: parseFloat(payAmount),
          paymentMethod: payMethod,
          transactionReference: `TXN-${Date.now().toString().slice(-6)}`,
          notes: "Settlement recorded via Invoices console.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: "success",
          text: `Payment of ${formatCurrency(parseFloat(payAmount))} reconciled successfully!`,
        });
        setIsPayModalOpen(false);
        fetchInvoices();
        setSelectedInvoice({
          ...selectedInvoice,
          paidAmount: selectedInvoice.paidAmount + parseFloat(payAmount),
          status: selectedInvoice.paidAmount + parseFloat(payAmount) >= selectedInvoice.totalAmount ? "paid" : "confirmed",
        });
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Payment recording failed." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Error submitting payment." });
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Metrics
  const totalBilled = invoices.reduce((acc, inv) => acc + (typeof inv.totalAmount === "number" ? inv.totalAmount : 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (typeof inv.paidAmount === "number" ? inv.paidAmount : typeof (inv as any).amountPaid === "number" ? (inv as any).amountPaid : 0), 0);
  const totalOutstanding = Math.max(
    0,
    invoices
      .filter((inv) => inv.status !== "cancelled" && inv.status !== "paid")
      .reduce((acc, inv) => {
        const paid = typeof inv.paidAmount === "number" ? inv.paidAmount : typeof (inv as any).amountPaid === "number" ? (inv as any).amountPaid : 0;
        return acc + Math.max(0, (inv.totalAmount || 0) - paid);
      }, 0)
  );
  const overdueCount = invoices.filter((inv) => {
    const paid = typeof inv.paidAmount === "number" ? inv.paidAmount : typeof (inv as any).amountPaid === "number" ? (inv as any).amountPaid : 0;
    return (
      (inv.status === "confirmed" || inv.status === "draft") &&
      new Date(inv.dueDate) < new Date() &&
      (inv.totalAmount || 0) > paid
    );
  }).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            feedbackMsg.type === "success"
              ? "bg-[#E7E1B1] border-[#C8D293] text-[#0D530E]"
              : "bg-red-100/70 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#306D29]" />
            <span className="font-medium">{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-[11px] font-semibold uppercase tracking-wider hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dunning Alert Banner if Overdue */}
      {overdueCount > 0 && (
        <div className="bg-[#FEF7E0] border border-[#E7E1B1] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B06000] animate-pulse shrink-0"></span>
            <div>
              <p className="text-xs font-semibold text-[#8C4A00]">
                DUNNING PROTOCOL ACTIVE: {overdueCount} INVOICE{overdueCount > 1 ? "S" : ""} PAST DUE DATE
              </p>
              <p className="text-xs text-[#8C4A00]/80 mt-0.5">
                Automated grace period running. Reconciled balances pending customer settlement.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className="text-xs font-medium bg-[#0D530E] text-[#FBF5DD] px-3.5 py-1.5 rounded-lg hover:bg-[#146615] transition-all self-start sm:self-auto"
          >
            View Pending Invoices
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0D530E] tracking-tight font-normal">
            Invoices & Settlements
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Automated recurring tax invoices with GST breakdown, payment reconciliations, and dunning logs.
          </p>
        </div>
      </div>

      {/* Metrics Row: Thin vertical dividers matching Reference A */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-4 py-2 border-y border-[#D8D1A4]/60">
        <div className="pr-4 lg:pr-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Total Invoiced</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {formatCurrency(totalBilled)}
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">
            Across {invoices.length} issued invoices
          </div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Collected Cash</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#306D29] mt-1 font-normal">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-[11px] text-[#306D29] mt-0.5">
            {totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0}% recovery rate
          </div>
        </div>

        <div className="px-4 lg:px-6 border-r border-[#D8D1A4]/60">
          <div className="text-xs text-[#0D530E]/70 font-sans">Outstanding Balance</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">
            Awaiting customer settlement
          </div>
        </div>

        <div className="pl-4 lg:pl-6">
          <div className="text-xs text-[#0D530E]/70 font-sans">Overdue Accounts</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#C5221F] mt-1 font-normal">
            {overdueCount}
          </div>
          <div className="text-[11px] text-[#C5221F] mt-0.5">
            Action required
          </div>
        </div>
      </div>

      {/* Control Bar: Status Tabs + Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "confirmed", label: "Confirmed" },
            { id: "paid", label: "Paid" },
            { id: "draft", label: "Draft" },
            { id: "cancelled", label: "Cancelled" },
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

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans bg-white/70 border border-[#D8D1A4] rounded-xl px-3 py-2 pl-9 text-[#0D530E] placeholder:text-[#0D530E]/40 focus:outline-none focus:border-[#0D530E]"
          />
          <Search className="w-4 h-4 text-[#0D530E]/50 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Invoices Ledger Table with Pale-Yellow Header (#E7E1B1) */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
        <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
          <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
            Invoice Registry & Audit Trail
          </h2>
          <span className="text-xs text-[#0D530E]/70 font-sans">
            Showing {invoices.length} invoices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Customer Organization</th>
                <th className="py-3 px-6">Issue Date</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6 text-right">Tax (18% GST)</th>
                <th className="py-3 px-6 text-right">Total Invoiced</th>
                <th className="py-3 px-6 text-right">Balance Due</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D1A4]/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#0D530E]/60">
                    Loading invoices ledger...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[#0D530E]/60">
                    No invoice records found matching criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const balanceDue = Math.max(0, inv.totalAmount - inv.paidAmount);
                  const isPastDue =
                    new Date(inv.dueDate) < new Date() &&
                    balanceDue > 0 &&
                    inv.status !== "cancelled";

                  return (
                    <tr key={inv.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-[#0D530E]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#0D530E]">
                          {inv.customer?.companyName || "Unknown"}
                        </div>
                        <div className="text-[11px] text-[#0D530E]/60">
                          {inv.customer?.gstin ? `GST: ${inv.customer.gstin}` : inv.customer?.email}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                        {new Date(inv.issueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-[11px]">
                        <span className={isPastDue ? "text-[#C5221F] font-semibold" : "text-[#0D530E]/70"}>
                          {new Date(inv.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {isPastDue && (
                          <span className="block text-[9px] uppercase tracking-wider text-[#C5221F] font-bold">
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-serif text-[#0D530E]/70">
                        {formatCurrency(inv.taxAmount)}
                      </td>
                      <td className="py-4 px-6 text-right font-serif text-sm text-[#0D530E]">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-right font-serif font-medium">
                        <span className={balanceDue > 0 ? "text-[#B06000]" : "text-[#2E8540]"}>
                          {formatCurrency(balanceDue)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            inv.status === "paid"
                              ? "bg-[#E6F4EA] text-[#2E8540]"
                              : inv.status === "confirmed"
                              ? isPastDue
                                ? "bg-[#FCE8E6] text-[#C5221F]"
                                : "bg-[#E7E1B1] text-[#0D530E]"
                              : inv.status === "cancelled"
                              ? "bg-stone-200/60 text-[#0D530E]/60"
                              : "bg-[#FEF7E0] text-[#B06000]"
                          }`}
                        >
                          <span className="mr-1.5">●</span>
                          <span className="capitalize">{inv.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 text-xs border border-[#D8D1A4] rounded-lg hover:bg-[#E7E1B1]/50 text-[#0D530E] transition-all"
                        >
                          View
                        </button>
                        {inv.status !== "paid" && inv.status !== "cancelled" && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPayAmount(balanceDue.toFixed(2));
                              setIsPayModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-lg transition-all font-medium"
                          >
                            Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail & Printable Dossier Modal */}
      {selectedInvoice && !isPayModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D8D1A4] p-7 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[#D8D1A4] pb-4">
              <div>
                <span className="text-[10px] font-sans bg-[#E7E1B1] text-[#0D530E] px-2.5 py-1 rounded-md uppercase font-semibold">
                  TAX INVOICE · GST 18% COMPLIANT
                </span>
                <h3 className="text-2xl font-serif text-[#0D530E] mt-2 font-normal">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-[#0D530E]/65 mt-0.5">
                  Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString("en-IN")} · Due:{" "}
                  {new Date(selectedInvoice.dueDate).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 border border-[#D8D1A4] rounded-lg hover:bg-[#E7E1B1]/40 text-[#0D530E]"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 text-lg font-mono"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Bill To & Bill From Cards */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#E7E1B1]/30 p-3.5 rounded-xl border border-[#D8D1A4]">
                <span className="text-[10px] font-semibold uppercase text-[#0D530E]/60 block mb-1">
                  Billed By (Issuer)
                </span>
                <div className="font-semibold text-[#0D530E]">Brightloop Technologies Ltd.</div>
                <div className="text-[11px] text-[#0D530E]/75 mt-0.5">GSTIN: 29AAAAA0000A1Z5</div>
                <div className="text-[11px] text-[#0D530E]/75">HQ: 104 Brigade Road, Bangalore</div>
              </div>

              <div className="bg-[#E7E1B1]/30 p-3.5 rounded-xl border border-[#D8D1A4]">
                <span className="text-[10px] font-semibold uppercase text-[#0D530E]/60 block mb-1">
                  Customer Entity
                </span>
                <div className="font-semibold text-[#0D530E]">
                  {selectedInvoice.customer.companyName}
                </div>
                <div className="text-[11px] text-[#0D530E]/75 mt-0.5">
                  Attn: {selectedInvoice.customer.contactName}
                </div>
                <div className="text-[11px] text-[#0D530E]/75">{selectedInvoice.customer.email}</div>
                {selectedInvoice.customer.gstin && (
                  <div className="text-[11px] text-[#0D530E]/75 font-mono">
                    GSTIN: {selectedInvoice.customer.gstin}
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Line Items */}
            <div className="border border-[#D8D1A4] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E7E1B1] text-[#0D530E] text-[11px] font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right">GST (18%)</th>
                    <th className="py-2.5 px-4 text-right">Net Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D1A4]/60">
                  {selectedInvoice.lines.map((line) => (
                    <tr key={line.id} className="text-[#0D530E]">
                      <td className="py-3 px-4 font-medium">
                        <div>{line.description}</div>
                        {line.variant && (
                          <div className="text-[10px] text-[#306D29]">
                            Applied Variant: {line.variant.variantName} (+₹{line.variant.priceAdjustment})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{line.quantity}</td>
                      <td className="py-3 px-4 text-right font-serif">{formatCurrency(line.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-serif">{formatCurrency(line.taxAmount)}</td>
                      <td className="py-3 px-4 text-right font-serif font-medium">
                        {formatCurrency(line.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#0D530E]/75">
                  <span>Taxable Subtotal:</span>
                  <span className="font-serif">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#0D530E]/75">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span className="font-serif">{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-[#306D29]">
                    <span>Promotional Discount:</span>
                    <span className="font-serif">-{formatCurrency(selectedInvoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-serif text-base text-[#0D530E] border-t border-[#D8D1A4] pt-2 font-normal">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-sans text-xs text-[#306D29] pt-1">
                  <span>Amount Settled:</span>
                  <span className="font-serif">{formatCurrency(selectedInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-serif text-sm font-normal text-[#C5221F] border-t border-[#D8D1A4]/60 pt-1">
                  <span>Balance Outstanding:</span>
                  <span>
                    {formatCurrency(Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount))}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-[#D8D1A4]">
              <div className="space-x-2">
                {selectedInvoice.status === "draft" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedInvoice.id, "confirm")}
                    className="px-3.5 py-1.5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl text-xs font-medium transition-all"
                  >
                    Confirm Invoice
                  </button>
                )}
                {selectedInvoice.status !== "cancelled" && selectedInvoice.status !== "paid" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedInvoice.id, "cancel")}
                    className="px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-xl text-xs transition-all"
                  >
                    Cancel Invoice
                  </button>
                )}
              </div>

              <div className="space-x-2">
                {selectedInvoice.status !== "paid" && selectedInvoice.status !== "cancelled" && (
                  <button
                    onClick={() => {
                      setPayAmount(
                        Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount).toFixed(2)
                      );
                      setIsPayModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl text-xs font-medium transition-all"
                  >
                    Collect / Record Payment →
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3.5 py-2 border border-[#D8D1A4] rounded-xl text-xs text-[#0D530E]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-md w-full border border-[#D8D1A4] overflow-hidden shadow-2xl">
            <div className="bg-[#E7E1B1] px-6 py-4 flex justify-between items-center border-b border-[#D8D1A4]">
              <h3 className="font-serif text-lg text-[#0D530E] font-normal">
                Record Payment Settlement
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="bg-[#E7E1B1]/30 p-3 rounded-xl border border-[#D8D1A4] text-[#0D530E]">
                <div className="flex justify-between">
                  <span className="text-[#0D530E]/70">Target Invoice:</span>
                  <span className="font-mono font-medium">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[#0D530E]/70">Total Outstanding:</span>
                  <span className="font-serif font-medium">
                    {formatCurrency(Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Settlement Amount (INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-xs font-serif border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Payment Method *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  <option value="bank_transfer">Direct Bank Transfer / NEFT</option>
                  <option value="upi">UPI / Instant QR</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="razorpay">Razorpay Checkout Gateway</option>
                  <option value="cash">Direct Cash / Cheque</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#D8D1A4]/60">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#0D530E]/70 hover:text-[#0D530E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2.5 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl font-medium disabled:opacity-50 transition-all tracking-wide"
                >
                  {submittingPayment ? "Reconciling..." : "Confirm & Post Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
