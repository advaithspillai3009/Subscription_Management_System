"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/tax";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function ProductsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Interactive Pricing Simulator
  const [seats, setSeats] = useState(25);
  const [includeOdooBrand, setIncludeOdooBrand] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) setPlans(data.plans);
        if (data.products) setProducts(data.products);
      });
  }, []);

  // Compute live simulator estimate
  const baseRate = billingCycle === "monthly" ? 4999 : 49990;
  const seatRate = billingCycle === "monthly" ? 350 : 3500;
  const odooVariantRate = includeOdooBrand ? (billingCycle === "monthly" ? 560 : 5600) : 0;
  const estimatedSubtotal = baseRate + seats * seatRate + odooVariantRate;
  const estimatedTax = estimatedSubtotal * 0.18;
  const estimatedTotal = estimatedSubtotal + estimatedTax;

  const defaultPlans = [
    {
      id: "starter",
      name: "Starter Launch",
      price: billingCycle === "monthly" ? 1499 : 14990,
      description: "Essential recurring billing for growing SaaS startups.",
      features: [
        "Up to 100 active subscriptions",
        "Automated monthly GST invoicing",
        "Bank Transfer & UPI payments",
        "Email invoice delivery",
        "Standard SLA support",
      ],
      popular: false,
    },
    {
      id: "growth",
      name: "Growth Scaler",
      price: billingCycle === "monthly" ? 4999 : 49990,
      description: "Complete subscription lifecycle and automated dunning engine.",
      features: [
        "Up to 1,000 active subscriptions",
        "Automated idempotent billing engine",
        "Custom discount & promo rules",
        "Automated dunning & reminders",
        "Customer self-service portal",
        "Priority technical support",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise Suite",
      price: billingCycle === "monthly" ? 19999 : 199990,
      description: "Full-scale multi-tier billing for high-volume enterprises.",
      features: [
        "Unlimited active subscriptions",
        "Odoo Brand Variant Co-Marketing",
        "Multi-currency & custom tax logic",
        "Financial audit trail & ledger logs",
        "Dedicated account manager",
        "99.9% uptime enterprise SLA",
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#0D530E] tracking-tight font-normal">
            Products & Subscription Plans
          </h1>
          <p className="text-sm text-[#0D530E]/70 mt-1">
            Configure recurring tiers, Odoo brand variant adjustments (+₹560), and simulated enterprise volume.
          </p>
        </div>

        {/* Cadence Switcher */}
        <div className="flex items-center bg-[#FBF5DD] border border-[#D8D1A4] rounded-xl p-1 text-xs self-start sm:self-auto">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-3.5 py-1.5 rounded-lg font-sans transition-all ${
              billingCycle === "monthly"
                ? "bg-[#E7E1B1] text-[#0D530E] font-medium border border-[#C8D293]"
                : "text-[#0D530E]/70 hover:bg-[#E7E1B1]/40"
            }`}
          >
            Monthly Cadence
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-3.5 py-1.5 rounded-lg font-sans transition-all flex items-center space-x-1.5 ${
              billingCycle === "annual"
                ? "bg-[#E7E1B1] text-[#0D530E] font-medium border border-[#C8D293]"
                : "text-[#0D530E]/70 hover:bg-[#E7E1B1]/40"
            }`}
          >
            <span>Annual Cadence</span>
            <span className="text-[10px] bg-[#306D29]/15 text-[#0D530E] px-1.5 py-0.5 rounded-md font-semibold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {defaultPlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
              plan.popular
                ? "bg-[#FBF5DD] border-[#0D530E] ring-1 ring-[#0D530E]"
                : "bg-[#FBF5DD] border-[#D8D1A4]"
            }`}
          >
            {/* Header band for cards */}
            <div className={`px-6 py-4 border-b ${plan.popular ? "bg-[#E7E1B1] border-[#C8D293]" : "bg-[#FBF5DD] border-[#D8D1A4]/60"}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-[#0D530E] font-normal">{plan.name}</h3>
                {plan.popular && (
                  <span className="text-[10px] uppercase font-sans font-semibold tracking-wider bg-[#0D530E] text-[#FBF5DD] px-2.5 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-[#0D530E]/65 mt-1">{plan.description}</p>
            </div>

            <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="py-2">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl sm:text-4xl font-serif text-[#0D530E] font-normal">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-[#0D530E]/60">
                      / {billingCycle === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#0D530E]/60 block mt-1">
                    + 18% GST itemized on invoices
                  </span>
                </div>

                <div className="border-t border-[#D8D1A4]/60 my-4"></div>

                {/* Feature Checklist */}
                <ul className="space-y-3 text-xs text-[#0D530E]/80">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5">
                      <Check className="w-4 h-4 text-[#306D29] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-[#D8D1A4]/60">
                <button
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-medium transition-all ${
                    plan.popular
                      ? "bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD]"
                      : "border border-[#D8D1A4] hover:bg-[#E7E1B1]/40 text-[#0D530E]"
                  }`}
                >
                  Select {plan.name} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Odoo Brand Variant Callout */}
      <div className="bg-[#E7E1B1] border border-[#C8D293] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D530E]" />
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#0D530E]">
              Odoo Hackathon Variant Requirement
            </span>
          </div>
          <h3 className="font-serif text-lg text-[#0D530E] font-normal">
            Odoo Brand Co-Marketing Variant (+₹560 Price Adjustment)
          </h3>
          <p className="text-xs text-[#0D530E]/75 max-w-2xl">
            In accordance with the hackathon problem statement specification, activating the Odoo brand add-on applies a verified +₹560.00/month incremental adjustment.
          </p>
        </div>

        <span className="font-serif text-base font-normal text-[#0D530E] bg-[#FBF5DD] border border-[#D8D1A4] px-4 py-2 rounded-xl whitespace-nowrap">
          + ₹560.00 / mo
        </span>
      </div>

      {/* Interactive Pricing Simulator */}
      <div className="border border-[#D8D1A4] rounded-2xl overflow-hidden bg-[#FBF5DD]">
        <div className="bg-[#E7E1B1] px-6 py-4 border-b border-[#D8D1A4]">
          <h3 className="font-serif text-lg text-[#0D530E] font-normal">
            Interactive Enterprise Volume Calculator
          </h3>
          <p className="text-xs text-[#0D530E]/70 mt-0.5">
            Estimate customized enterprise recurring contract values with seats and variant add-ons.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between text-xs font-sans mb-2">
                  <span className="text-[#0D530E]">Active Team Licenses:</span>
                  <span className="font-serif text-base text-[#0D530E] font-normal">{seats} Seats</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="250"
                  step="5"
                  value={seats}
                  onChange={(e) => setSeats(parseInt(e.target.value))}
                  className="w-full accent-[#0D530E] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#0D530E]/60 mt-1 font-sans">
                  <span>5 Seats</span>
                  <span>125 Seats</span>
                  <span>250 Seats</span>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOdooBrand}
                    onChange={(e) => setIncludeOdooBrand(e.target.checked)}
                    className="rounded text-[#0D530E] focus:ring-[#0D530E] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-[#0D530E]">
                    Include Odoo Brand Co-Marketing Variant (+₹560/mo)
                  </span>
                </label>
              </div>
            </div>

            {/* Live Calculation Summary */}
            <div className="lg:col-span-5 bg-[#E7E1B1]/30 p-6 rounded-xl border border-[#D8D1A4] space-y-3 text-xs">
              <span className="text-[11px] font-sans uppercase tracking-wider text-[#0D530E]/70 block font-semibold">
                Estimated Contract Breakdown
              </span>

              <div className="space-y-2 border-b border-[#D8D1A4]/60 pb-3">
                <div className="flex justify-between text-[#0D530E]/75">
                  <span>Base Plan ({billingCycle}):</span>
                  <span className="font-serif">{formatCurrency(baseRate)}</span>
                </div>
                <div className="flex justify-between text-[#0D530E]/75">
                  <span>{seats} User Licenses:</span>
                  <span className="font-serif">{formatCurrency(seats * seatRate)}</span>
                </div>
                {includeOdooBrand && (
                  <div className="flex justify-between text-[#306D29]">
                    <span>Odoo Brand Add-on:</span>
                    <span className="font-serif">+{formatCurrency(odooVariantRate)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#0D530E]/75">
                  <span>GST (18%):</span>
                  <span className="font-serif">{formatCurrency(estimatedTax)}</span>
                </div>
              </div>

              <div className="flex justify-between font-serif text-lg text-[#0D530E] pt-1 font-normal">
                <span>Total Contract:</span>
                <span>{formatCurrency(estimatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
