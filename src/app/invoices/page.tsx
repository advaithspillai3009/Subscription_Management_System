"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/tax";
import { Search, Printer, Check, AlertCircle, ArrowUpRight } from "lucide-react";

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
    } catch (err) {
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
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Error submitting payment." });
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Metrics
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalOutstanding = invoices
    .filter((inv) => inv.status !== "cancelled" && inv.status !== "paid")
    .reduce((acc, inv) => acc + (inv.totalAmount - inv.paidAmount), 0);
  const overdueCount = invoices.filter((inv) => {
    return (
      (inv.status === "confirmed" || inv.status === "draft") &&
      new Date(inv.dueDate) < new Date() &&
      inv.totalAmount > inv.paidAmount
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-md border text-xs flex items-center justify-between ${
            feedbackMsg.type === "success"
              ? "bg-[#E6F2F0] border-[#2F7D72] text-[#2F7D72]"
              : "bg-red-50 border-red-300 text-[#D9383A]"
          }`}
        >
          <span className="font-semibold">{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="font-bold hover:opacity-75 uppercase text-[10px]"
          >
            [ Dismiss ]
          </button>
        </div>
      )}

      {/* Dunning Alert Banner if Overdue */}
      {overdueCount > 0 && (
        <div className="bg-[#FFFBEB] border border-[#F59E0B] p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-pulse flex-shrink-0"></span>
            <div>
              <p className="text-xs font-bold text-[#92400E]">
                DUNNING PROTOCOL ACTIVE: {overdueCount} INVOICE{overdueCount > 1 ? "S" : ""} PAST DUE DATE
              </p>
              <p className="text-xs text-[#78350F] mt-0.5">
                Automated grace period running. Total outstanding balances pending settlement.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className="text-xs font-semibold bg-[#F59E0B] text-white px-3 py-1.5 rounded-md hover:bg-[#D97706] transition-colors self-start sm:self-auto"
          >
            View Pending Invoices
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1E6E3]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#12191A] tracking-tight">
            Invoices & Settlements
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Automated recurring tax invoices with 18% GST breakdown, payment reconciliations, and dunning workflows.
          </p>
        </div>
      </div>

      {/* Telemetry Metric Cards with Proper Spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Total Invoiced
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] block">
            {formatCurrency(totalBilled)}
          </span>
          <span className="text-[11px] text-[#5D6B6C] block">
            Across {invoices.length} issued records
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Collected Cash
          </span>
          <span className="text-2xl font-bold font-mono text-[#2E8540] block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-[#2E8540] block">
            {totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : 0}% recovery rate
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Outstanding Balance
          </span>
          <span className="text-2xl font-bold font-mono text-[#D97706] block">
            {formatCurrency(totalOutstanding)}
          </span>
          <span className="text-[11px] text-[#D97706] block">
            Awaiting customer settlement
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Overdue Invoices
          </span>
          <span className="text-2xl font-bold font-mono text-[#D9383A] block">
            {overdueCount}
          </span>
          <span className="text-[11px] text-[#D9383A] block">
            Requires dunning follow-up
          </span>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 border border-[#E1E6E3] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {["all", "draft", "confirmed", "paid", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                statusFilter === st
                  ? "bg-[#2F7D72] text-white"
                  : "bg-[#F8FAF9] text-[#5D6B6C] hover:text-[#12191A] border border-[#E1E6E3]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded-md px-3 py-2 pl-9 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
          />
          <Search className="w-4 h-4 text-[#5D6B6C] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Invoices Table with Proper Spacing */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Customer Organization</th>
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
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#5D6B6C]">
                    Querying financial ledger...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#5D6B6C]">
                    No invoices matching current filter criteria.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const balanceDue = inv.totalAmount - inv.paidAmount;
                  const isPastDue =
                    new Date(inv.dueDate) < new Date() &&
                    inv.status !== "paid" &&
                    inv.status !== "cancelled";

                  return (
                    <tr key={inv.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#12191A]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#12191A]">
                          {inv.customer?.companyName || "Unknown"}
                        </div>
                        <div className="text-[11px] text-[#5D6B6C] font-mono">
                          {inv.customer?.gstin ? `GST: ${inv.customer.gstin}` : inv.customer?.email}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[11px] font-mono text-[#5D6B6C]">
                        {new Date(inv.issueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-[11px] font-mono">
                        <span className={isPastDue ? "text-[#D9383A] font-bold" : "text-[#5D6B6C]"}>
                          {new Date(inv.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {isPastDue && (
                          <span className="block text-[9px] uppercase tracking-wider text-[#D9383A] font-bold">
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-[11px] text-[#5D6B6C]">
                        {formatCurrency(inv.taxAmount)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#12191A] text-sm">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold">
                        <span className={balanceDue > 0 ? "text-[#D97706]" : "text-[#2E8540]"}>
                          {formatCurrency(balanceDue)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            inv.status === "paid"
                              ? "bg-green-50 text-[#2E8540] border border-green-200"
                              : inv.status === "confirmed"
                              ? isPastDue
                                ? "bg-red-50 text-[#D9383A] border border-red-200"
                                : "bg-blue-50 text-[#2563EB] border border-blue-200"
                              : inv.status === "cancelled"
                              ? "bg-gray-100 text-[#5D6B6C]"
                              : "bg-amber-50 text-[#D97706] border border-amber-200"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-[#F8FAF9] hover:bg-[#E1E6E3] text-[#12191A] rounded border border-[#E1E6E3] transition-colors"
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
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#2F7D72] hover:bg-[#26665D] text-white rounded transition-colors"
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

      {/* Invoice Detail & Printable Modal */}
      {selectedInvoice && !isPayModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E1E6E3] p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-[#E1E6E3] pb-4">
              <div>
                <span className="text-[10px] font-mono bg-[#E6F2F0] text-[#2F7D72] px-2 py-0.5 rounded uppercase font-semibold">
                  TAX INVOICE · GST 18% COMPLIANT
                </span>
                <h3 className="text-xl font-bold font-mono text-[#12191A] mt-2">
                  {selectedInvoice.invoiceNumber}
                </h3>
                <p className="text-xs text-[#5D6B6C]">
                  Issued on: {new Date(selectedInvoice.issueDate).toLocaleDateString("en-IN")} · Due date:{" "}
                  {new Date(selectedInvoice.dueDate).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            {/* Billed From & To with proper spacing */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-[#F8FAF9] p-4 rounded-lg border border-[#E1E6E3]">
              <div>
                <span className="text-[10px] text-[#5D6B6C] uppercase font-bold block">Provider</span>
                <p className="font-bold text-[#12191A] mt-1">BRIGHTLOOP TECHNOLOGIES PVT LTD</p>
                <p className="text-[#5D6B6C]">Cyber City, Bengaluru 560001</p>
                <p className="text-[#5D6B6C] font-mono">GSTIN: 29AAACB1234F1Z8</p>
              </div>
              <div>
                <span className="text-[10px] text-[#5D6B6C] uppercase font-bold block">Customer</span>
                <p className="font-bold text-[#12191A] mt-1">{selectedInvoice.customer?.companyName}</p>
                <p className="text-[#5D6B6C]">Attn: {selectedInvoice.customer?.contactName}</p>
                <p className="text-[#5D6B6C] font-mono">
                  GSTIN: {selectedInvoice.customer?.gstin || "Unregistered"}
                </p>
                <p className="text-[#5D6B6C]">{selectedInvoice.customer?.email}</p>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-[#E1E6E3] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAF9] font-mono text-[10px] text-[#5D6B6C] uppercase border-b border-[#E1E6E3]">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-right">Qty</th>
                    <th className="py-2.5 px-4 text-right">Rate</th>
                    <th className="py-2.5 px-4 text-right">GST (18%)</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E6E3]">
                  {selectedInvoice.lines.map((ln) => (
                    <tr key={ln.id}>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#12191A]">{ln.description}</div>
                        {ln.variant && (
                          <div className="text-[10px] text-[#2F7D72] font-mono">
                            + {ln.variant.variantName} (+₹{ln.variant.priceAdjustment})
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">{ln.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono">{formatCurrency(ln.unitPrice)}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#5D6B6C]">{formatCurrency(ln.taxAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">{formatCurrency(ln.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#5D6B6C]">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-[#2E8540]">
                    <span>Discount:</span>
                    <span>- {formatCurrency(selectedInvoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#5D6B6C]">
                  <span>CGST (9%):</span>
                  <span>{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                </div>
                <div className="flex justify-between text-[#5D6B6C]">
                  <span>SGST (9%):</span>
                  <span>{formatCurrency(selectedInvoice.taxAmount / 2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#12191A] border-t border-[#E1E6E3] pt-2">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#2E8540]">
                  <span>Paid:</span>
                  <span>{formatCurrency(selectedInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-[#D97706] border-t border-dashed border-[#E1E6E3] pt-1">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-[#E1E6E3]">
              <div className="space-x-2">
                {selectedInvoice.status === "draft" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedInvoice.id, "confirm")}
                    className="px-3 py-1.5 text-xs font-medium bg-[#2F7D72] text-white rounded-md hover:bg-[#26665D]"
                  >
                    Confirm Invoice
                  </button>
                )}
                {selectedInvoice.status !== "cancelled" && selectedInvoice.status !== "paid" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedInvoice.id, "cancel")}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-[#D9383A] rounded-md hover:bg-red-100"
                  >
                    Cancel Invoice
                  </button>
                )}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-medium bg-[#F8FAF9] border border-[#E1E6E3] text-[#12191A] rounded-md hover:bg-[#E1E6E3]"
                >
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E1E6E3] text-[#5D6B6C] rounded-md hover:text-black"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-sm font-bold text-[#12191A]">
                Record Payment Settlement
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5D6B6C]">
              Invoice: <span className="font-mono font-bold text-[#12191A]">{selectedInvoice.invoiceNumber}</span>
              <br />
              Customer: <span className="font-semibold text-[#12191A]">{selectedInvoice.customer?.companyName}</span>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Payment Amount (INR ₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-sm font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
                <span className="text-[10px] text-[#5D6B6C] mt-1 block font-mono">
                  Remaining balance: {formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full text-xs border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="upi">UPI (Unified Payments Interface)</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="cheque">Demand Draft / Cheque</option>
                  <option value="cash">Direct Cash Voucher</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E1E6E3]">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5D6B6C] hover:text-[#12191A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-4 py-1.5 text-xs bg-[#2F7D72] text-white rounded-md hover:bg-[#26665D] font-medium disabled:opacity-50"
                >
                  {submittingPayment ? "Recording..." : "Reconcile Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
