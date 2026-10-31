"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Plus, Check, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

interface QuotationLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  totalAmount: number;
  product?: { name: string; sku: string };
  variant?: { variantName: string };
}

interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  planId: string;
  status: string;
  validUntil: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentTerms?: string;
  notes?: string;
  createdAt: string;
  customer: {
    companyName: string;
    contactName: string;
    email: string;
  };
  plan: {
    name: string;
    frequency: string;
  };
  lines: QuotationLine[];
}

interface CustomerOption {
  id: string;
  companyName: string;
  contactName: string;
}

interface PlanOption {
  id: string;
  name: string;
  basePrice: number;
  frequency: string;
}

interface TemplateOption {
  id: string;
  name: string;
  planId: string;
  validityDays: number;
  paymentTerms: string;
  notes?: string;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [validityDays, setValidityDays] = useState("30");
  const [paymentTerms, setPaymentTerms] = useState("Immediate upon subscription deployment");
  const [quoteNotes, setQuoteNotes] = useState("Standard enterprise SLA with 99.9% uptime.");
  const [lineUnitPrice, setLineUnitPrice] = useState<number>(4999);
  const [lineQuantity, setLineQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuotationsAndData = async () => {
    try {
      setLoading(true);
      const [qRes, cRes, pRes] = await Promise.all([
        fetch("/api/quotations"),
        fetch("/api/customers"),
        fetch("/api/products"),
      ]);

      const qData = await qRes.json();
      const cData = await cRes.json();
      const pData = await pRes.json();

      if (qData.success) {
        setQuotations(qData.quotations);
        setTemplates(qData.templates || []);
      }
      if (cData.success) {
        setCustomers(cData.customers);
        if (cData.customers.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(cData.customers[0].id);
        }
      }
      if (pData.success) {
        setPlans(pData.plans);
        if (pData.plans.length > 0 && !selectedPlanId) {
          setSelectedPlanId(pData.plans[0].id);
          setLineUnitPrice(pData.plans[0].basePrice);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotationsAndData();
  }, []);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p.id === planId);
    if (plan) {
      setLineUnitPrice(plan.basePrice);
    }
  };

  const handleApplyTemplate = (tpl: TemplateOption) => {
    setSelectedPlanId(tpl.planId);
    setValidityDays(tpl.validityDays.toString());
    setPaymentTerms(tpl.paymentTerms);
    if (tpl.notes) setQuoteNotes(tpl.notes);
    const plan = plans.find((p) => p.id === tpl.planId);
    if (plan) setLineUnitPrice(plan.basePrice);
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      const lines = [
        {
          productId: selectedPlanId,
          description: `${selectedPlan?.name || "Subscription Service"} - ${selectedPlan?.frequency || "Monthly"} Tier`,
          quantity: lineQuantity,
          unitPrice: lineUnitPrice,
        },
      ];

      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          planId: selectedPlanId,
          validityDays: parseInt(validityDays),
          paymentTerms,
          notes: quoteNotes,
          lines,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Quotation ${data.quotation.quotationNumber} generated successfully!`,
        });
        setIsCreateModalOpen(false);
        fetchQuotationsAndData();
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to create quotation." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertToSubscription = async (id: string) => {
    try {
      setConvertingId(id);
      const res = await fetch(`/api/quotations/${id}/convert`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Quotation converted! Active Subscription ${data.subscription.subscriptionNumber} deployed and linked.`,
        });
        fetchQuotationsAndData();
        if (selectedQuote && selectedQuote.id === id) {
          setSelectedQuote(null);
        }
      } else {
        setFeedback({ type: "error", text: data.error || "Conversion failed." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error during conversion." });
    } finally {
      setConvertingId(null);
    }
  };

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
            Commercial Quotations
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Draft customized pricing proposals and convert approved quotes into recurring subscriptions with 1 click.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] text-xs font-medium rounded-xl transition-all shadow-none self-start sm:self-auto tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>Draft proposal +</span>
        </button>
      </div>

      {/* Templates Strip */}
      {templates.length > 0 && (
        <div className="bg-[#E7E1B1]/30 border border-[#D8D1A4] rounded-2xl p-6 space-y-3">
          <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0D530E]">
            Preconfigured Proposal Templates
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="border border-[#D8D1A4] p-4 rounded-xl flex justify-between items-center bg-[#FBF5DD] hover:bg-[#E7E1B1]/40 transition-colors"
              >
                <div>
                  <h4 className="font-serif text-base text-[#0D530E]">{tpl.name}</h4>
                  <p className="text-xs text-[#0D530E]/65 mt-0.5">
                    Plan: <span className="font-medium text-[#0D530E]">{tpl.planId}</span> · Validity: {tpl.validityDays} Days
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleApplyTemplate(tpl);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-[#E7E1B1] border border-[#C8D293] text-[#0D530E] hover:bg-[#D8D1A4] rounded-lg transition-colors"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotations Table */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
        <div className="bg-[#E7E1B1] px-6 py-4 flex items-center justify-between border-b border-[#D8D1A4]">
          <h2 className="font-serif text-lg text-[#0D530E] tracking-tight font-normal">
            Proposals & Commercial Offers
          </h2>
          <span className="text-xs text-[#0D530E]/70 font-sans">
            {quotations.length} quotes drafted
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D8D1A4] font-sans text-[11px] text-[#0D530E]/70 uppercase tracking-wider bg-transparent">
                <th className="py-3 px-6">Quote #</th>
                <th className="py-3 px-6">Client Organization</th>
                <th className="py-3 px-6">Plan & Cadence</th>
                <th className="py-3 px-6">Valid Until</th>
                <th className="py-3 px-6 text-right">Subtotal</th>
                <th className="py-3 px-6 text-right">Total (18% GST)</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D1A4]/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#0D530E]/60">
                    Loading proposal pipeline...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#0D530E]/60">
                    No quotations drafted yet. Click Draft proposal above.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => {
                  const isExpired = new Date(q.validUntil) < new Date() && q.status !== "converted";

                  return (
                    <tr key={q.id} className="hover:bg-[#E7E1B1]/25 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-[#0D530E]">
                        {q.quotationNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#0D530E]">{q.customer?.companyName}</div>
                        <div className="text-[11px] text-[#0D530E]/60">{q.customer?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#0D530E]">{q.plan?.name}</div>
                        <div className="text-[10px] uppercase font-sans text-[#306D29]">
                          {q.plan?.frequency}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[11px]">
                        <span className={isExpired ? "text-[#C5221F] font-semibold" : "text-[#0D530E]/70"}>
                          {new Date(q.validUntil).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {isExpired && (
                          <span className="block text-[9px] uppercase tracking-wider text-[#C5221F] font-bold">
                            EXPIRED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-serif text-[#0D530E]/70">
                        {formatCurrency(q.subtotal)}
                      </td>
                      <td className="py-4 px-6 text-right font-serif text-sm font-normal text-[#0D530E]">
                        {formatCurrency(q.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            q.status === "converted"
                              ? "bg-[#E6F4EA] text-[#2E8540]"
                              : q.status === "confirmed"
                              ? "bg-[#E7E1B1] text-[#0D530E]"
                              : isExpired
                              ? "bg-[#FCE8E6] text-[#C5221F]"
                              : "bg-[#FEF7E0] text-[#B06000]"
                          }`}
                        >
                          <span className="mr-1.5">●</span>
                          <span className="capitalize">{q.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="px-2.5 py-1 text-xs border border-[#D8D1A4] rounded-lg hover:bg-[#E7E1B1]/50 text-[#0D530E] transition-all"
                        >
                          Preview
                        </button>
                        {q.status !== "converted" && (
                          <button
                            onClick={() => handleConvertToSubscription(q.id)}
                            disabled={convertingId === q.id}
                            className="px-2.5 py-1 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-lg transition-all font-medium disabled:opacity-50"
                          >
                            {convertingId === q.id ? "Converting..." : "Convert to Sub →"}
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

      {/* Proposal Preview Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D8D1A4] p-7 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-[#D8D1A4] pb-4">
              <div>
                <span className="text-[10px] font-sans bg-[#E7E1B1] text-[#0D530E] px-2.5 py-1 rounded-md uppercase font-semibold">
                  Commercial Proposal · Confidential
                </span>
                <h3 className="text-2xl font-serif text-[#0D530E] mt-2 font-normal">
                  {selectedQuote.quotationNumber}
                </h3>
                <p className="text-xs text-[#0D530E]/65 mt-0.5">
                  Prepared for: <span className="font-medium text-[#0D530E]">{selectedQuote.customer?.companyName}</span> ·
                  Valid until: {new Date(selectedQuote.validUntil).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2.5 bg-[#E7E1B1]/30 p-4 rounded-xl border border-[#D8D1A4]">
              <div className="flex justify-between text-[#0D530E]">
                <span className="text-[#0D530E]/70">Target Plan:</span>
                <span className="font-serif text-sm">{selectedQuote.plan?.name}</span>
              </div>
              <div className="flex justify-between text-[#0D530E]">
                <span className="text-[#0D530E]/70">Billing Cadence:</span>
                <span className="capitalize text-[#306D29] font-medium">{selectedQuote.plan?.frequency}</span>
              </div>
              <div className="flex justify-between text-[#0D530E]">
                <span className="text-[#0D530E]/70">Payment Terms:</span>
                <span>{selectedQuote.paymentTerms || "Standard terms apply"}</span>
              </div>
              {selectedQuote.notes && (
                <div className="border-t border-[#D8D1A4]/60 pt-2 text-[#0D530E]/80">
                  <span className="block text-[10px] uppercase font-semibold mb-0.5">Notes:</span>
                  <p>{selectedQuote.notes}</p>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="border border-[#D8D1A4] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#E7E1B1] text-[#0D530E] text-[11px] font-medium uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Tax (18% GST)</th>
                    <th className="p-3 text-right">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D1A4]/60">
                  {selectedQuote.lines.map((l) => (
                    <tr key={l.id} className="text-[#0D530E]">
                      <td className="p-3 font-medium">{l.description}</td>
                      <td className="p-3 text-right font-mono">{l.quantity}</td>
                      <td className="p-3 text-right font-serif">{formatCurrency(l.unitPrice)}</td>
                      <td className="p-3 text-right font-serif">{formatCurrency(l.taxAmount)}</td>
                      <td className="p-3 text-right font-serif font-medium">{formatCurrency(l.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-2 text-xs">
              <div className="w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-[#0D530E]/75">
                  <span>Subtotal:</span>
                  <span className="font-serif">{formatCurrency(selectedQuote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#0D530E]/75">
                  <span>GST (18%):</span>
                  <span className="font-serif">{formatCurrency(selectedQuote.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-serif text-lg text-[#0D530E] border-t border-[#D8D1A4] pt-2 font-normal">
                  <span>Quotation Total:</span>
                  <span>{formatCurrency(selectedQuote.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#D8D1A4]">
              {selectedQuote.status !== "converted" ? (
                <button
                  onClick={() => handleConvertToSubscription(selectedQuote.id)}
                  disabled={convertingId === selectedQuote.id}
                  className="px-4 py-2 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl text-xs font-medium transition-all"
                >
                  {convertingId === selectedQuote.id ? "Deploying..." : "Approve & Deploy Subscription →"}
                </button>
              ) : (
                <span className="text-xs text-[#2E8540] font-medium flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Converted to live contract</span>
                </span>
              )}

              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 border border-[#D8D1A4] rounded-xl text-xs text-[#0D530E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft New Proposal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-lg w-full border border-[#D8D1A4] overflow-hidden shadow-2xl">
            <div className="bg-[#E7E1B1] px-6 py-4 flex justify-between items-center border-b border-[#D8D1A4]">
              <h3 className="font-serif text-lg text-[#0D530E] font-normal">
                Draft Commercial Proposal
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Customer Organization *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Subscription Plan Tier *
                </label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2.5 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.frequency}) — Base: ₹{p.basePrice.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Rate per Unit (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={lineUnitPrice}
                    onChange={(e) => setLineUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-serif border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Terms & Commercial Notes
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#D8D1A4]/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#0D530E]/70 hover:text-[#0D530E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl font-medium disabled:opacity-50 transition-all tracking-wide"
                >
                  {submitting ? "Drafting..." : "Generate Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
