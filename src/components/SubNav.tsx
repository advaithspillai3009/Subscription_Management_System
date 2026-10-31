"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SubNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/" },
    { label: "Customers", href: "/customers" },
    { label: "Products & Variants", href: "/products" },
    { label: "Subscriptions", href: "/subscriptions", badge: "1,428" },
    { label: "Quotations", href: "/quotations" },
    { label: "Invoices & Settlements", href: "/invoices" },
    { label: "Payments", href: "/payments" },
    { label: "Discounts & Rules", href: "/discounts" },
    { label: "Customer Portal", href: "/portal" },
    { label: "Staff Governance", href: "/staff" },
  ];

  return (
    <section className="border-b border-[#E1E6E3] bg-[#F8FAF9]/80 overflow-x-auto sticky top-20 z-40 backdrop-blur-sm">
      <div className="max-w-[1680px] mx-auto px-6 flex items-center justify-between text-xs font-medium py-3 whitespace-nowrap">
        <div className="flex items-center space-x-7">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={`flex items-center space-x-1.5 pb-2 -mb-3 transition-colors ${
                  isActive
                    ? "text-[#111819] font-semibold border-b-2 border-[#2F7D72]"
                    : "text-[#5D6B6C] hover:text-[#111819]"
                }`}
                href={item.href}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D72]" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#E1E6E3] text-[10px] text-[#2F7D72] rounded font-mono font-medium ml-1">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center space-x-2 text-[11px] font-mono text-[#5D6B6C]">
          <span>CATALOG NODE:</span>
          <span className="text-[#2F7D72] font-bold">SYNCHRONIZED (BLR-NODE-01)</span>
        </div>
      </div>
    </section>
  );
}
