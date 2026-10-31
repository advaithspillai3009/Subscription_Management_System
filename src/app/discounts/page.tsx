"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Plus, Tag, Check, Calendar } from "lucide-react";

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
    } catch (err) {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setSubmitting(false);
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
            Promotional & Enterprise Discounts
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Configure percentage incentives, fixed credit vouchers, validity windows, and safety margin caps.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-[#2F7D72] hover:bg-[#26665D] text-white text-xs font-medium rounded-md shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Discount Rule</span>
        </button>
      </div>

      {/* Grid of Promotional Rules with Proper Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-8 text-center text-xs text-[#5D6B6C]">
            Loading discount configurations...
          </div>
        ) : discounts.length === 0 ? (
          <div className="col-span-3 py-8 text-center text-xs text-[#5D6B6C]">
            No promotional discount rules configured. Click New Discount Rule above.
          </div>
        ) : (
          discounts.map((rule) => {
            const isExpired = rule.validUntil && new Date(rule.validUntil) < new Date();

            return (
              <div
                key={rule.id}
                className="bg-white border border-[#E1E6E3] rounded-lg p-6 shadow-xs space-y-4 hover:border-[#2F7D72] transition-colors relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-base font-bold text-[#12191A] tracking-wider bg-[#F8FAF9] border border-[#E1E6E3] px-2.5 py-1 rounded-md">
                      {rule.code}
                    </span>
                    <span className="block text-xs text-[#5D6B6C] mt-2.5">
                      {rule.description || "Promotional incentive rule"}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      !rule.isActive || isExpired
                        ? "bg-red-50 text-[#D9383A] border border-red-200"
                        : "bg-green-50 text-[#2E8540] border border-green-200"
                    }`}
                  >
                    {isExpired ? "EXPIRED" : rule.isActive ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>

                <div className="border-t border-b border-[#E1E6E3] py-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5D6B6C]">Incentive:</span>
                    <span className="font-bold font-mono text-[#2F7D72]">
                      {rule.discountType === "percentage"
                        ? `${rule.value}% OFF`
                        : `₹${rule.value} FIXED CREDIT`}
                    </span>
                  </div>
                  {rule.minPurchaseAmount && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#5D6B6C]">Min. Purchase:</span>
                      <span className="font-mono">{formatCurrency(rule.minPurchaseAmount)}</span>
                    </div>
                  )}
                  {rule.maxDiscountAmount && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#5D6B6C]">Max. Cap:</span>
                      <span className="font-mono">{formatCurrency(rule.maxDiscountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#5D6B6C]">Valid Until:</span>
                    <span className="font-mono">
                      {rule.validUntil
                        ? new Date(rule.validUntil).toLocaleDateString("en-IN")
                        : "Indefinite"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#5D6B6C]">
                  <span>Applied at checkout</span>
                  <span className="font-semibold text-[#2F7D72]">100% Auditable</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Discount Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E1E6E3] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E1E6E3] pb-3">
              <h3 className="text-base font-bold text-[#12191A]">
                Create Discount Rule
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-black font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI2026, FESTIVE15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full font-mono uppercase font-bold border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Festival 15% recurring discount on annual plans"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={discountType === "percentage" ? "15" : "500"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Min Purchase (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2000"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#5D6B6C] uppercase mb-1">
                  Valid Until Date (Optional)
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full font-mono border border-[#E1E6E3] rounded-md px-3 py-2 text-[#12191A] focus:outline-none focus:border-[#2F7D72]"
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
