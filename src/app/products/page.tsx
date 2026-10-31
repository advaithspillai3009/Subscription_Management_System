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
      description: "Complete subscription lifecycle and dunning engine.",
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1E6E3]">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#12191A] tracking-tight">
            Products & Subscription Plans
          </h1>
          <p className="text-xs text-[#5D6B6C] mt-1">
            Configure recurring tiers, Odoo brand variant adjustments (+₹560), and simulated enterprise volume.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center bg-[#FFFFFF] border border-[#E1E6E3] rounded-lg p-1 text-xs self-start sm:self-auto shadow-xs">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-[#2F7D72] text-white"
                : "text-[#5D6B6C] hover:text-[#12191A]"
            }`}
          >
            Monthly Cadence
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1.5 ${
              billingCycle === "annual"
                ? "bg-[#2F7D72] text-white"
                : "text-[#5D6B6C] hover:text-[#12191A]"
            }`}
          >
            <span>Annual Cadence</span>
            <span className="text-[10px] bg-[#E6F2F0] text-[#2F7D72] px-1.5 py-0.2 rounded font-bold">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid with Proper Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {defaultPlans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg p-6 border transition-all flex flex-col justify-between ${
              plan.popular
                ? "border-[#2F7D72] ring-1 ring-[#2F7D72] shadow-sm relative"
                : "border-[#E1E6E3] hover:border-[#2F7D72] shadow-xs"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-6 text-[10px] font-mono uppercase bg-[#2F7D72] text-white px-2.5 py-0.5 rounded-full font-semibold">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#12191A]">{plan.name}</h3>
                <p className="text-xs text-[#5D6B6C] mt-1">{plan.description}</p>
              </div>

              <div className="border-t border-b border-[#E1E6E3] py-4">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold font-mono text-[#12191A]">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-xs text-[#5D6B6C]">
                    / {billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>
                <span className="text-[10px] text-[#5D6B6C] font-mono block mt-1">
                  + 18% GST calculated at settlement
                </span>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2.5 text-xs text-[#5D6B6C]">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-[#2F7D72] flex-shrink-0" />
                    <span className="text-[#12191A]">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <button
                className={`w-full py-2.5 px-4 rounded-md text-xs font-semibold transition-colors ${
                  plan.popular
                    ? "bg-[#2F7D72] hover:bg-[#26665D] text-white"
                    : "bg-[#F8FAF9] hover:bg-[#E6F2F0] hover:text-[#2F7D72] text-[#12191A] border border-[#E1E6E3]"
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Odoo Brand Variant Callout */}
      <div className="bg-[#E6F2F0] border border-[#2F7D72] rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D72]" />
            <span className="text-xs font-mono font-bold uppercase text-[#2F7D72]">
              HACKATHON SCENE 2 VARIANT SPECIFICATION
            </span>
          </div>
          <h3 className="text-base font-bold text-[#12191A]">
            Odoo Brand Co-Marketing Variant (+₹560 Adjustment)
          </h3>
          <p className="text-xs text-[#5D6B6C] max-w-3xl">
            In accordance with the hackathon problem statement, launching a plan variant with the Odoo brand incorporates a fixed price increment of +₹560.
          </p>
        </div>

        <span className="text-sm font-mono font-bold text-[#2F7D72] bg-white border border-[#2F7D72] px-3.5 py-1.5 rounded-md whitespace-nowrap shadow-xs">
          + ₹560.00 / month
        </span>
      </div>

      {/* Simplified Real-Time Pricing Simulator */}
      <div className="bg-white border border-[#E1E6E3] rounded-lg p-6 shadow-xs space-y-6">
        <div className="border-b border-[#E1E6E3] pb-3">
          <h3 className="text-sm font-bold text-[#12191A]">
            Interactive Enterprise Volume Calculator
          </h3>
          <p className="text-xs text-[#5D6B6C]">
            Estimate customized enterprise recurring contract values with seats and variant add-ons.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span className="text-[#12191A]">Active Team / Seat Licenses:</span>
                <span className="font-mono text-[#2F7D72] font-bold text-sm">{seats} Seats</span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={seats}
                onChange={(e) => setSeats(parseInt(e.target.value))}
                className="w-full accent-[#2F7D72] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#5D6B6C] font-mono mt-1">
                <span>5 Seats</span>
                <span>125 Seats</span>
                <span>250 Seats</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeOdooBrand}
                  onChange={(e) => setIncludeOdooBrand(e.target.checked)}
                  className="rounded text-[#2F7D72] focus:ring-[#2F7D72] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-[#12191A]">
                  Include Odoo Brand Co-Marketing Variant (+₹560/mo)
                </span>
              </label>
            </div>
          </div>

          {/* Real-time Calculation Summary (5 cols) */}
          <div className="lg:col-span-5 bg-[#F8FAF9] p-5 rounded-lg border border-[#E1E6E3] space-y-3 font-mono text-xs">
            <span className="text-[10px] text-[#5D6B6C] uppercase tracking-wider block font-bold">
              ESTIMATED CONTRACT BREAKDOWN
            </span>

            <div className="space-y-1.5 border-b border-[#E1E6E3] pb-3">
              <div className="flex justify-between text-[#5D6B6C]">
                <span>Base Plan ({billingCycle}):</span>
                <span>{formatCurrency(baseRate)}</span>
              </div>
              <div className="flex justify-between text-[#5D6B6C]">
                <span>{seats} User Licenses:</span>
                <span>{formatCurrency(seats * seatRate)}</span>
              </div>
              {includeOdooBrand && (
                <div className="flex justify-between text-[#2F7D72]">
                  <span>Odoo Brand Add-on:</span>
                  <span>+{formatCurrency(odooVariantRate)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5D6B6C]">
                <span>GST (18%):</span>
                <span>{formatCurrency(estimatedTax)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-base text-[#12191A] pt-1">
              <span>Total Contract:</span>
              <span className="text-[#2F7D72]">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
