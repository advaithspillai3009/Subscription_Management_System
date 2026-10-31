"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Plus, Tag, Check, Calendar, CheckCircle2 } from "lucide-react";

interface DiscountRule {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  value: number;
  validFrom: string;
  validUntil?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
  createdAt: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [value, setValue] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/discounts");
      const data = await res.json();
      if (data.success) {
        setDiscounts(data.discounts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description,
          discountType,
          value: parseFloat(value),
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          minPurchaseAmount: minPurchase ? parseFloat(minPurchase) : null,
          maxDiscountAmount: maxDiscount ? parseFloat(maxDiscount) : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: "success",
          text: `Discount rule ${data.discount.code} created successfully!`,
        });
        setIsCreateModalOpen(false);
        setCode("");
        setDescription("");
        setValue("");
        fetchDiscounts();
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to create discount rule." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setSubmitting(false);
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
            Promotional & Enterprise Discounts
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Configure percentage incentives, fixed credit vouchers, validity windows, and safety margin caps.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] text-xs font-medium rounded-xl transition-all shadow-none self-start sm:self-auto tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span>New discount rule +</span>
        </button>
      </div>

      {/* Grid of Promotional Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-10 text-center text-xs text-[#0D530E]/60">
            Loading discount configurations...
          </div>
        ) : discounts.length === 0 ? (
          <div className="col-span-3 py-10 text-center text-xs text-[#0D530E]/60">
            No promotional discount rules configured yet.
          </div>
        ) : (
          discounts.map((rule) => {
            const isExpired = rule.validUntil && new Date(rule.validUntil) < new Date();

            return (
              <div
                key={rule.id}
                className="bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-6 space-y-4 hover:border-[#0D530E] transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-sm font-semibold text-[#0D530E] tracking-wider bg-[#E7E1B1] border border-[#C8D293] px-3 py-1 rounded-lg">
                      {rule.code}
                    </span>
                    <span className="block text-xs text-[#0D530E]/70 mt-2.5">
                      {rule.description || "Promotional incentive rule"}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      !rule.isActive || isExpired
                        ? "bg-[#FCE8E6] text-[#C5221F]"
                        : "bg-[#E6F4EA] text-[#2E8540]"
                    }`}
                  >
                    <span className="mr-1">●</span>
                    <span>{isExpired ? "Expired" : rule.isActive ? "Active" : "Disabled"}</span>
                  </span>
                </div>

                <div className="border-t border-b border-[#D8D1A4]/60 py-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#0D530E]/70">Incentive:</span>
                    <span className="font-serif text-base font-normal text-[#306D29]">
                      {rule.discountType === "percentage"
                        ? `${rule.value}% OFF`
                        : `₹${rule.value} FIXED`}
                    </span>
                  </div>
                  {rule.minPurchaseAmount && (
                    <div className="flex justify-between text-[11px] text-[#0D530E]/75">
                      <span>Min. Purchase:</span>
                      <span className="font-serif">{formatCurrency(rule.minPurchaseAmount)}</span>
                    </div>
                  )}
                  {rule.maxDiscountAmount && (
                    <div className="flex justify-between text-[11px] text-[#0D530E]/75">
                      <span>Max. Cap:</span>
                      <span className="font-serif">{formatCurrency(rule.maxDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-[#0D530E]/75">
                    <span>Valid Until:</span>
                    <span>
                      {rule.validUntil
                        ? new Date(rule.validUntil).toLocaleDateString("en-IN")
                        : "Indefinite"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#0D530E]/60">
                  <span>Applied at checkout</span>
                  <span className="font-medium text-[#306D29]">100% Auditable</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Discount Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FBF5DD] rounded-2xl max-w-md w-full border border-[#D8D1A4] overflow-hidden shadow-2xl">
            <div className="bg-[#E7E1B1] px-6 py-4 flex justify-between items-center border-b border-[#D8D1A4]">
              <h3 className="font-serif text-lg text-[#0D530E] font-normal">
                Create Discount Rule
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#0D530E]/60 hover:text-[#0D530E] p-1 font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BRIGHTLOOP2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono uppercase font-semibold border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% Off Annual Enterprise Contracts"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full text-xs font-sans border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={discountType === "percentage" ? "15" : "1000"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full text-xs font-serif border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Min Purchase (₹)
                  </label>
                  <input
                    type="number"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full text-xs font-serif border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full text-xs font-serif border border-[#D8D1A4] bg-white/70 rounded-xl px-3 py-2 text-[#0D530E] focus:outline-none focus:border-[#0D530E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium uppercase tracking-wider text-[#0D530E]/70 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
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
                  {submitting ? "Saving..." : "Deploy Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
