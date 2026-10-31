"use client";

import React, { useState } from "react";
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
      <div className="flex items-center space-x-1 flex-shrink-0">
        <span
          className="w-2.5 h-5 rounded-full inline-block"
          style={{ backgroundColor: pillColor }}
        />
        <span
          className="w-2.5 h-5 rounded-full inline-block"
          style={{ backgroundColor: pillColor }}
        />
      </div>
      <span className="text-xl font-bold tracking-tight font-sans lowercase">
        brightloop
      </span>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainNav = [
    { label: "Overview", href: "/", icon: Home },
    { label: "Subscriptions", href: "/subscriptions", icon: Layers },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "Plans & Products", href: "/products", icon: Box },
    { label: "Invoices", href: "/invoices", icon: FileText },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Discounts", href: "/discounts", icon: Tag },
    { label: "Reports", href: "/reports", icon: BarChart2 },
  ];

  const secondaryNav = [
    { label: "Settings", href: "/staff", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#0D530E] text-[#FBF5DD] shadow-md"
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

      {/* Sidebar Container: Fixed Forest Green (#0D530E) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0D530E] flex flex-col justify-between py-6 px-4 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="space-y-8">
          {/* Top Brand Logo */}
          <div className="px-3 pt-1">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <BrightloopLogo />
            </Link>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#E7E1B1] text-[#0D530E] font-semibold shadow-xs"
                      : "text-[#FBF5DD]/85 hover:bg-[#165E17] hover:text-[#FBF5DD]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-[#0D530E]" : "text-[#FBF5DD]/80"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Separator + Settings */}
        <div className="space-y-3 pt-4 border-t border-[#1C691D]">
          {secondaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#E7E1B1] text-[#0D530E] font-semibold"
                    : "text-[#FBF5DD]/85 hover:bg-[#165E17] hover:text-[#FBF5DD]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-[#0D530E]" : "text-[#FBF5DD]/80"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}

