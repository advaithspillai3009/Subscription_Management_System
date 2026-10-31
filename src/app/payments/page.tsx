"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Plus, Search, CheckCircle2 } from "lucide-react";

interface PaymentRecord {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  transactionReference?: string;
  notes?: string;
  customer: {
    companyName: string;
    contactName: string;
    email: string;
  };
  invoice: {
    invoiceNumber: string;
    totalAmount: number;
    status: string;
  };
}

interface PendingInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  customer: {
    companyName: string;
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [payRes, invRes] = await Promise.all([
        fetch("/api/payments"),
        fetch("/api/invoices?status=confirmed"),
      ]);
      const payData = await payRes.json();
      const invData = await invRes.json();

      if (payData.success) {
        setPayments(payData.payments);
      }
      if (invData.success) {
        const pending = (invData.invoices || []).filter(
          (i: any) => i.totalAmount > i.paidAmount
        );
        setPendingInvoices(pending);
        if (pending.length > 0 && !selectedInvoiceId) {
          setSelectedInvoiceId(pending[0].id);
          setAmount((pending[0].totalAmount - pending[0].paidAmount).toFixed(2));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleInvoiceSelect = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = pendingInvoices.find((i) => i.id === id);
    if (inv) {
      setAmount((inv.totalAmount - inv.paidAmount).toFixed(2));
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoiceId,
          amount: parseFloat(amount),
          paymentMethod,
          transactionReference: reference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: "Manual ledger settlement reconciliation.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Payment ${data.payment.paymentNumber} of ${formatCurrency(
            parseFloat(amount)
          )} reconciled successfully!`,
        });
        setIsRecordModalOpen(false);
        setReference("");
        fetchPayments();
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to record payment." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
    const matchesSearch =
      !searchQuery ||
      p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customer?.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.transactionReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoice?.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const avgPayment = payments.length > 0 ? totalCollected / payments.length : 0;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-md border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-[#E6F2F0] border-[#2F7D72] text-[#2F7D72]"
              : "bg-red-50 border-red-300 text-[#D9383A]"
          }`}
        >
          <span className="font-semibold">{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="font-bold hover:opacity-75 uppercase text-[10px]"
          >
            [ Dismiss ]
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1E6E3]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#12191A] tracking-tight">
            Financial Payments & Settlements
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Reconcile collections across Bank Transfers, UPI, and Corporate Credit Cards with UTR tracking.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#2F7D72] hover:bg-[#26665D] text-white text-xs font-medium rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Settlement</span>
        </button>
      </div>

      {/* Telemetry Metric Cards with Proper Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Reconciled Collections
          </span>
          <span className="text-2xl font-bold font-mono text-[#2E8540] block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-[#2E8540] block">
            Across {payments.length} verified transactions
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Average Payment Ticket
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] block">
            {formatCurrency(avgPayment)}
          </span>
          <span className="text-[11px] text-[#5D6B6C] block">
            Mean enterprise transaction size
          </span>
        </div>

        <div className="bg-white p-6 border border-[#E1E6E3] rounded-lg shadow-xs space-y-2">
          <span className="text-xs font-medium text-[#5D6B6C] block">
            Pending Invoices
          </span>
          <span className="text-2xl font-bold font-mono text-[#D97706] block">
            {pendingInvoices.length}
          </span>
          <span className="text-[11px] text-[#D97706] block">
            Invoices awaiting reconciliation
          </span>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 border border-[#E1E6E3] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "bank_transfer", "upi", "credit_card", "cheque", "cash"].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                methodFilter === m
                  ? "bg-[#2F7D72] text-white"
                  : "bg-[#F8FAF9] text-[#5D6B6C] hover:text-[#12191A] border border-[#E1E6E3]"
              }`}
            >
              {m.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search reference, customer, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded-md px-3 py-2 pl-9 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
          />
          <Search className="w-4 h-4 text-[#5D6B6C] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Payments Table with Proper Spacing */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <th className="py-3.5 px-6">Payment #</th>
                <th className="py-3.5 px-6">Customer Organization</th>
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Payment Date</th>
                <th className="py-3.5 px-6">Method & UTR</th>
                <th className="py-3.5 px-6 text-right">Settled Amount</th>
                <th className="py-3.5 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5D6B6C]">
                    Querying reconciliation ledger...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#5D6B6C]">
                    No payments found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#12191A]">
                      {p.paymentNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#12191A]">{p.customer?.companyName}</div>
                      <div className="text-[11px] text-[#5D6B6C]">{p.customer?.contactName}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[#2F7D72] font-semibold">
                      {p.invoice?.invoiceNumber}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[#5D6B6C]">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-mono text-[11px] uppercase text-[#12191A] font-semibold">
                        {p.paymentMethod.replace("_", " ")}
                      </div>
                      {p.transactionReference && (
                        <div className="text-[11px] font-mono text-[#5D6B6C]">
                          Ref: {p.transactionReference}
                        </div>
                      )}
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

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-base font-bold text-[#12191A]">
                Record Payment Settlement
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            {pendingInvoices.length === 0 ? (
              <p className="text-xs text-[#5D6B6C]">
                No invoices currently require payment reconciliation.
              </p>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Select Target Invoice *
                  </label>
                  <select
                    required
                    value={selectedInvoiceId}
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  >
                    {pendingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.customer?.companyName} (Due: ₹
                        {(inv.totalAmount - inv.paidAmount).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Settlement Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                    <option value="upi">UPI (Unified Payments Interface)</option>
                    <option value="credit_card">Corporate Credit Card</option>
                    <option value="cheque">Demand Draft / Cheque</option>
                    <option value="cash">Direct Cash Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Transaction / UTR Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-20261031-987654"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-[#E1E6E3]">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#5D6B6C] hover:text-[#12191A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs bg-[#2F7D72] text-white rounded-md hover:bg-[#26665D] font-medium disabled:opacity-50"
                  >
                    {submitting ? "Reconciling..." : "Save Payment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
