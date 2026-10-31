"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Plus, Check, FileText, ArrowRight } from "lucide-react";

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
    } catch (err) {
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
    } catch (err) {
      setFeedback({ type: "error", text: "Network error during conversion." });
    } finally {
      setConvertingId(null);
    }
  };

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
            Commercial Quotations
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Draft customized pricing proposals and convert approved quotes into recurring subscriptions with 1 click.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#2F7D72] hover:bg-[#26665D] text-white text-xs font-medium rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Draft Proposal</span>
        </button>
      </div>

      {/* Quotation Templates Strip */}
      {templates.length > 0 && (
        <div className="bg-white border border-[#E1E6E3] rounded-lg p-5 space-y-3 shadow-xs">
          <span className="text-xs font-medium text-[#5D6B6C] uppercase tracking-wider block">
            Preconfigured Proposal Templates
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="border border-[#E1E6E3] p-4 rounded-lg hover:border-[#2F7D72] transition-colors flex justify-between items-center bg-[#F8FAF9]"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#12191A]">{tpl.name}</h4>
                  <p className="text-[11px] text-[#5D6B6C] mt-0.5">
                    Plan: <span className="text-[#2F7D72] font-medium">{tpl.planId}</span> · Validity: {tpl.validityDays} Days
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleApplyTemplate(tpl);
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E1E6E3] hover:bg-[#E6F2F0] hover:text-[#2F7D72] rounded-md transition-colors"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotations Table with Proper Spacing */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E1E6E3] font-mono text-[10px] text-[#5D6B6C] uppercase">
                <th className="py-3.5 px-6">Quote #</th>
                <th className="py-3.5 px-6">Client Organization</th>
                <th className="py-3.5 px-6">Plan & Cadence</th>
                <th className="py-3.5 px-6">Valid Until</th>
                <th className="py-3.5 px-6 text-right">Subtotal</th>
                <th className="py-3.5 px-6 text-right">Total (18% GST)</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E6E3]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5D6B6C]">
                    Loading proposal pipeline...
                  </td>
                </tr>
              ) : quotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5D6B6C]">
                    No quotations drafted yet. Click Draft Proposal above.
                  </td>
                </tr>
              ) : (
                quotations.map((q) => {
                  const isExpired = new Date(q.validUntil) < new Date() && q.status !== "converted";

                  return (
                    <tr key={q.id} className="hover:bg-[#F8FAF9] transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[#12191A]">
                        {q.quotationNumber}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#12191A]">{q.customer?.companyName}</div>
                        <div className="text-[11px] text-[#5D6B6C]">{q.customer?.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-[#12191A]">{q.plan?.name}</div>
                        <div className="text-[10px] font-mono uppercase text-[#2F7D72]">
                          {q.plan?.frequency}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px]">
                        <span className={isExpired ? "text-[#D9383A] font-semibold" : "text-[#5D6B6C]"}>
                          {new Date(q.validUntil).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {isExpired && (
                          <span className="block text-[9px] uppercase text-[#D9383A] font-bold">EXPIRED</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-[#5D6B6C]">
                        {formatCurrency(q.subtotal)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#12191A] text-sm">
                        {formatCurrency(q.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            q.status === "converted"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : q.status === "confirmed"
                              ? "bg-green-50 text-[#2E8540] border border-green-200"
                              : isExpired
                              ? "bg-red-50 text-[#D9383A] border border-red-200"
                              : "bg-blue-50 text-[#2563EB] border border-blue-200"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedQuote(q)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-[#F8FAF9] hover:bg-[#E1E6E3] text-[#12191A] rounded-md border border-[#E1E6E3] transition-colors"
                        >
                          Preview
                        </button>
                        {q.status !== "converted" && (
                          <button
                            onClick={() => handleConvertToSubscription(q.id)}
                            disabled={convertingId === q.id}
                            className="px-2.5 py-1 text-[11px] font-medium bg-[#2F7D72] hover:bg-[#26665D] text-white rounded-md transition-colors disabled:opacity-50"
                          >
                            {convertingId === q.id ? "Converting..." : "Convert to Sub"}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E1E6E3] p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-[#E1E6E3] pb-4">
              <div>
                <span className="text-[10px] font-mono bg-[#E6F2F0] text-[#2F7D72] px-2 py-0.5 rounded uppercase font-semibold">
                  COMMERCIAL PROPOSAL · CONFIDENTIAL
                </span>
                <h3 className="text-xl font-bold font-mono text-[#12191A] mt-2">
                  {selectedQuote.quotationNumber}
                </h3>
                <p className="text-xs text-[#5D6B6C]">
                  Prepared for: <span className="font-bold text-[#12191A]">{selectedQuote.customer?.companyName}</span> ·
                  Valid until: {new Date(selectedQuote.validUntil).toLocaleDateString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 bg-[#F8FAF9] p-4 rounded-lg border border-[#E1E6E3]">
              <div className="flex justify-between">
                <span className="text-[#5D6B6C]">Target Plan:</span>
                <span className="font-bold text-[#12191A]">{selectedQuote.plan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6B6C]">Billing Cadence:</span>
                <span className="uppercase text-[#2F7D72] font-semibold">{selectedQuote.plan?.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5D6B6C]">Payment Terms:</span>
                <span>{selectedQuote.paymentTerms || "Standard terms apply"}</span>
              </div>
              {selectedQuote.notes && (
                <div className="border-t border-[#E1E6E3] pt-2 text-[#5D6B6C]">
                  <span className="block text-[10px] uppercase font-bold mb-0.5">Notes:</span>
                  <p>{selectedQuote.notes}</p>
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="border border-[#E1E6E3] rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAF9] font-mono text-[10px] text-[#5D6B6C] uppercase">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Tax (18% GST)</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E6E3]">
                  {selectedQuote.lines.map((ln) => (
                    <tr key={ln.id}>
                      <td className="p-3 font-medium">{ln.description}</td>
                      <td className="p-3 text-right font-mono">{ln.quantity}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(ln.unitPrice)}</td>
                      <td className="p-3 text-right font-mono text-[#5D6B6C]">{formatCurrency(ln.taxAmount)}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatCurrency(ln.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E1E6E3]">
              <div>
                {selectedQuote.status !== "converted" && (
                  <button
                    onClick={() => handleConvertToSubscription(selectedQuote.id)}
                    className="px-4 py-2 text-xs bg-[#2F7D72] hover:bg-[#26665D] text-white rounded-md font-medium"
                  >
                    Confirm & Convert to Subscription
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-4 py-2 text-xs bg-[#F8FAF9] border border-[#E1E6E3] rounded-md hover:bg-[#E1E6E3]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-base font-bold text-[#12191A]">
                Draft Commercial Proposal
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Target Customer *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Subscription Plan *
                  </label>
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.frequency}) - ₹{p.basePrice}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    License Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lineQuantity}
                    onChange={(e) => setLineQuantity(parseInt(e.target.value) || 1)}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Unit Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lineUnitPrice}
                    onChange={(e) => setLineUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              {/* Math calculation */}
              <div className="bg-[#F8FAF9] p-3 rounded-md border border-[#E1E6E3] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between text-[#5D6B6C]">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(lineQuantity * lineUnitPrice)}</span>
                </div>
                <div className="flex justify-between text-[#5D6B6C]">
                  <span>GST (18%):</span>
                  <span>{formatCurrency(lineQuantity * lineUnitPrice * 0.18)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#12191A] border-t border-[#E1E6E3] pt-1">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(lineQuantity * lineUnitPrice * 1.18)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Proposal Notes / SLA
                </label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E1E6E3]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#5D6B6C] hover:text-[#12191A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs bg-[#2F7D72] text-white rounded-md hover:bg-[#26665D] font-medium disabled:opacity-50"
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
