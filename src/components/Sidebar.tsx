"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Layers,
  Users,
  Box,
  FileText,
  CreditCard,
  Tag,
  BarChart2,
  Settings,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
} from "lucide-react";

export function BrightloopLogo({
  textColor = "text-[#FBF5DD]",
  pillColor = "#E7E1B1",
}: {
  textColor?: string;
  pillColor?: string;
}) {
  return (
    <div className={`flex items-center space-x-2.5 ${textColor}`}>
      <div className="flex items-center space-x-1 shrink-0">
        <span
          className="w-2.5 h-5 rounded-full inline-block"
          style={{ backgroundColor: pillColor }}
        />
        <span
          className="w-2.5 h-5 rounded-full inline-block"
          style={{ backgroundColor: pillColor }}
        />
      </div>
      <span className="text-xl font-medium tracking-tight font-sans lowercase">
        brightloop
      </span>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("admin");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  // Admin Navigation
  const adminNav = [
    { label: "Overview", href: "/", icon: Home },
    { label: "Subscriptions", href: "/subscriptions", icon: Layers },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Plans & Products", href: "/products", icon: Box },
    { label: "Quotations", href: "/quotations", icon: FileText },
    { label: "Invoices", href: "/invoices", icon: FileText },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Discounts", href: "/discounts", icon: Tag },
    { label: "Reports", href: "/reports", icon: BarChart2 },
  ];

  // Staff Navigation (Daily Operations)
  const staffNav = [
    { label: "Overview", href: "/", icon: Home },
    { label: "Subscriptions", href: "/subscriptions", icon: Layers },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Plans & Products", href: "/products", icon: Box },
    { label: "Quotations", href: "/quotations", icon: FileText },
    { label: "Invoices", href: "/invoices", icon: FileText },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Discounts", href: "/discounts", icon: Tag },
  ];

  // Customer Navigation
  const customerNav = [
    { label: "My Portal", href: "/portal", icon: Home },
    { label: "Subscriptions", href: "/portal", icon: Layers },
    { label: "Invoices & Billing", href: "/portal", icon: FileText },
    { label: "Payment Receipts", href: "/portal", icon: CreditCard },
  ];

  const currentNav =
    userRole === "customer"
      ? customerNav
      : userRole === "staff"
      ? staffNav
      : adminNav;

  const secondaryNav =
    userRole === "admin"
      ? [
          { label: "Team & RBAC", href: "/staff", icon: Users },
          { label: "Settings", href: "/settings", icon: Settings },
        ]
      : [];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-[#0D530E] text-[#FBF5DD] shadow-md"
        aria-label="Toggle Navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container: Fixed Deep Forest Green (#0D530E) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0D530E] flex flex-col justify-between py-6 px-4 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="space-y-7">
          {/* Top Brand Logo */}
          <div className="px-3 pt-1">
            <Link href={userRole === "customer" ? "/portal" : "/"} onClick={() => setMobileOpen(false)}>
              <BrightloopLogo />
            </Link>
          </div>

          {/* Role Status Tag */}
          <div className="px-3">
            <span className="text-[10px] font-sans font-medium tracking-wider uppercase bg-white/10 text-[#FBF5DD]/80 px-2.5 py-1 rounded-md inline-block">
              {userRole === "admin" ? "Admin Authority" : userRole === "staff" ? "Staff Operator" : "Customer Portal"}
            </span>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            {currentNav.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all ${
                    isActive
                      ? "bg-[#E7E1B1] text-[#0D530E] font-medium shadow-xs"
                      : "text-[#FBF5DD]/80 hover:text-[#FBF5DD] hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#0D530E]" : "text-[#FBF5DD]/70"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation (Settings & Team for Admin) */}
        {secondaryNav.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-1">
            {secondaryNav.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all ${
                    isActive
                      ? "bg-[#E7E1B1] text-[#0D530E] font-medium"
                      : "text-[#FBF5DD]/80 hover:text-[#FBF5DD] hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#0D530E]" : "text-[#FBF5DD]/70"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
}
