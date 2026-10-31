"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";

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

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Reconciled Collections
          </span>
          <span className="text-2xl font-bold font-mono text-[#2E8540] mt-1 block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[10px] text-[#2E8540] mt-1 block">
            Across {payments.length} verified transactions
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Average Transaction
          </span>
          <span className="text-2xl font-bold font-mono text-[#12191A] mt-1 block">
            {formatCurrency(avgPayment)}
          </span>
          <span className="text-[10px] text-[#5D6B6C] mt-1 block">
            Mean enterprise ticket size
          </span>
        </div>

        <div className="bg-white p-4 border border-[#E1E6E3] rounded-md shadow-sm">
          <span className="text-[10px] font-mono text-[#5D6B6C] uppercase tracking-wider block">
            Pending Settlements
          </span>
          <span className="text-2xl font-bold font-mono text-[#D97706] mt-1 block">
            {pendingInvoices.length}
          </span>
          <span className="text-[10px] text-[#D97706] mt-1 block">
            Invoices awaiting payment
          </span>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 border border-[#E1E6E3] rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-[#5D6B6C] uppercase mr-1">Method:</span>
          {["all", "bank_transfer", "upi", "credit_card", "cheque", "cash"].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1 text-xs font-mono uppercase rounded transition-colors ${
                methodFilter === m
                  ? "bg-[#2F7D72] text-white font-medium"
                  : "bg-[#F3F4F3] text-[#5D6B6C] hover:bg-[#E1E6E3]"
              }`}
            >
              {m.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search reference, customer, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded px-3 py-1.5 pl-8 text-[#12191A] focus:outline-none focus:border-[#2F7D72] w-64"
            />
            <span className="absolute left-2.5 top-2 text-xs text-[#5D6B6C]">🔍</span>
          </div>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-3 py-1.5 text-xs font-mono bg-[#12191A] hover:bg-[#2C3536] text-white rounded font-medium flex items-center space-x-1 whitespace-nowrap"
          >
            <span>+</span>
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-[#E1E6E3] rounded-md overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-[#E1E6E3] flex justify-between items-center bg-[#F8FAF9]">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#12191A]">
            Financial Settlement & Cash Collections
          </h2>
          <span className="text-[10px] font-mono text-[#5D6B6C]">
            COUNT: {filteredPayments.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E1E6E3] bg-[#F8FAF9] text-[10px] font-mono text-[#5D6B6C] uppercase">
                <th className="py-2.5 px-4">Payment #</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Payment Date</th>
                <th className="py-2.5 px-4">Method & Ref</th>
                <th className="py-2.5 px-4 text-right">Settled Amount</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-mono text-[#5D6B6C]">
                    Querying reconciliation ledger...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-mono text-[#5D6B6C]">
                    No payments found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAF9] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#12191A]">
                      {p.paymentNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#12191A]">{p.customer?.companyName}</div>
                      <div className="text-[10px] text-[#5D6B6C]">{p.customer?.contactName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#2F7D72]">
                      {p.invoice?.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5D6B6C]">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] uppercase text-[#12191A]">
                        {p.paymentMethod.replace("_", " ")}
                      </div>
                      {p.transactionReference && (
                        <div className="text-[10px] font-mono text-[#5D6B6C]">
                          Ref: {p.transactionReference}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#2E8540] text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-green-100 text-[#2E8540] font-semibold">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-sm font-mono font-bold text-[#12191A] uppercase">
                Record Payment Reconciliation
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            {pendingInvoices.length === 0 ? (
              <p className="text-xs text-[#5D6B6C] font-mono">
                No invoices currently require payment reconciliation.
              </p>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Select Target Invoice *
                  </label>
                  <select
                    required
                    value={selectedInvoiceId}
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                    className="w-full border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
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
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Settlement Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                    <option value="upi">UPI (Unified Payments Interface)</option>
                    <option value="credit_card">Corporate Credit Card</option>
                    <option value="cheque">Demand Draft / Cheque</option>
                    <option value="cash">Direct Cash Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#5D6B6C] uppercase mb-1">
                    Transaction / UTR Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-20261031-987654"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded px-3 py-1.5 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-[#E1E6E3]">
                  <button
                    type="button"
                    onClick={() => setIsRecordModalOpen(false)}
                    className="px-3 py-1.5 font-mono text-[#5D6B6C] hover:text-[#12191A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 font-mono bg-[#2F7D72] text-white rounded hover:bg-[#26665D] font-medium disabled:opacity-50"
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
