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
    } catch {
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
            Financial Payments & Settlements
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Reconcile collections across Bank Transfers, UPI, and Corporate Credit Cards with UTR tracking.
          </p>
        </div>

        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] text-xs font-medium rounded-xl transition-all shadow-none self-start sm:self-auto tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>Record settlement +</span>
        </button>
      </div>

      {/* Metrics Row: Thin vertical dividers matching Reference A */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 py-2 border-y border-[#D8D1A4]/60">
        <div className="pr-4 md:pr-6 border-b md:border-b-0 md:border-r border-[#D8D1A4]/60 pb-4 md:pb-0">
          <div className="text-xs text-[#0D530E]/70 font-sans">Reconciled Collections</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#306D29] mt-1 font-normal">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-[11px] text-[#306D29] mt-0.5">Across {payments.length} verified transactions</div>
        </div>

        <div className="px-0 md:px-6 border-b md:border-b-0 md:border-r border-[#D8D1A4]/60 pb-4 md:pb-0">
          <div className="text-xs text-[#0D530E]/70 font-sans">Average Payment Ticket</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#0D530E] mt-1 font-normal">
            {formatCurrency(avgPayment)}
          </div>
          <div className="text-[11px] text-[#0D530E]/60 mt-0.5">Mean enterprise transaction size</div>
        </div>

        <div className="pl-0 md:pl-6">
          <div className="text-xs text-[#0D530E]/70 font-sans">Pending Invoices</div>
          <div className="text-2xl sm:text-3xl font-serif text-[#C5221F] mt-1 font-normal">
            {pendingInvoices.length}
          </div>
          <div className="text-[11px] text-[#C5221F] mt-0.5">Awaiting customer clearance</div>
        </div>
      </div>

      {/* Control Bar: Payment Method Tabs + Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Methods" },
            { id: "bank_transfer", label: "Bank Transfer" },
            { id: "upi", label: "UPI" },
            { id: "credit_card", label: "Credit Card" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMethodFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-sans rounded-lg transition-all ${
                methodFilter === tab.id
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
            placeholder="Search txn #, invoice, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-sans bg-white/70 border border-[#D8D1A4] rounded-xl px-3 py-2 pl-9 text-[#0D530E] placeholder:text-[#0D530E]/40 focus:outline-none focus:border-[#0D530E]"
          />
          <Search className="w-4 h-4 text-[#0D530E]/50 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
        <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
          <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
            Settlement Audit Registry
          </h2>
          <span className="text-xs text-[#0D530E]/70 font-sans">
            {filteredPayments.length} transactions reconciled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                <th className="py-3 px-6">Payment #</th>
                <th className="py-3 px-6">Customer Organization</th>
                <th className="py-3 px-6">Linked Invoice</th>
                <th className="py-3 px-6">Method</th>
                <th className="py-3 px-6">Transaction Ref / UTR</th>
                <th className="py-3 px-6">Settlement Date</th>
                <th className="py-3 px-6 text-right">Amount Settled</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D1A4]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#0D530E]/60">
                    Loading payments registry...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#0D530E]/60">
                    No payment records found matching query.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#0D530E]">
                      {p.paymentNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#0D530E]">{p.customer?.companyName}</div>
                      <div className="text-[11px] text-[#0D530E]/60">{p.customer?.email}</div>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-[#0D530E]">
                      {p.invoice?.invoiceNumber}
                    </td>
                    <td className="py-4 px-6 capitalize text-[#0D530E]/70">
                      {p.paymentMethod.replace("_", " ")}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-[#0D530E]/60">
                      {p.transactionReference || "AUTO-RECONCILED"}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-[#0D530E]/70">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-right font-serif text-sm font-normal text-[#306D29]">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6F4EA] text-[#2E8540]">
                        <span className="mr-1.5">●</span>
                        <span className="capitalize">{p.status}</span>
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
          <div className="bg-[#FBF5DD] rounded-2xl max-w-md w-full border border-[#D8D1A4] overflow-hidden shadow-2xl">
            <div className="bg-[#E7E1B1] px-6 py-4 flex justify-between items-center border-b border-[#D8D1A4]">
              <h3 className="font-serif text-lg text-[#0D530E] font-normal">
                Record Payment Settlement
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Select Unsettled Invoice *
                </label>
                {pendingInvoices.length === 0 ? (
                  <p className="text-xs text-[#0D530E]/60 bg-[#E7E1B1]/30 p-3 rounded-xl border border-[#D8D1A4]">
                    All confirmed invoices are fully settled!
                  </p>
                ) : (
                  <select
                    required
                    value={selectedInvoiceId}
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  >
                    {pendingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — {inv.customer?.companyName} (Due: ₹
                        {(inv.totalAmount - inv.paidAmount).toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Settlement Amount (INR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs font-serif border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  <option value="bank_transfer">Direct Bank Transfer / NEFT</option>
                  <option value="upi">UPI / Instant QR</option>
                  <option value="credit_card">Corporate Credit Card</option>
                  <option value="razorpay">Razorpay Gateway</option>
                  <option value="cash">Direct Cash / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Transaction UTR / Reference ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-20261103-98214"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full text-xs font-mono border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] placeholder:text-[#0D530E]/35 focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#D8D1A4]/60">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#0D530E]/70 hover:text-[#0D530E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || pendingInvoices.length === 0}
                  className="px-5 py-2.5 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl font-medium disabled:opacity-50 transition-all tracking-wide"
                >
                  {submitting ? "Reconciling..." : "Confirm & Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
