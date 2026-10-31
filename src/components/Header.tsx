"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; role: string; email: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser({
            fullName: "Advaith Pillai",
            role: "admin",
            email: "admin@brightloop.software",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Subscriptions", href: "/subscriptions" },
    { label: "Invoices", href: "/invoices" },
    { label: "Customers", href: "/customers" },
    { label: "Plans & Products", href: "/products" },
    { label: "Quotations", href: "/quotations" },
    { label: "Payments", href: "/payments" },
    { label: "Discounts", href: "/discounts" },
    { label: "Customer Portal", href: "/portal" },
    { label: "Team", href: "/staff" },
  ];

  return (
    <header className="w-full border-b border-[#E1E6E3] bg-[#FFFFFF] sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-10">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <span className="w-3 h-3 rounded-full bg-[#2F7D72] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-[#12191A] font-display">
              brightloop
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#2F7D72] bg-[#E6F2F0] px-2 py-0.5 rounded font-semibold">
              Subscriptions
            </span>
          </Link>

          {/* Clean Navigation Bar with proper spacing */}
          <nav className="hidden xl:flex items-center space-x-7 text-sm">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-5 text-xs font-medium tracking-wide transition-all border-b-2 -mb-[1px] ${
                    isActive
                      ? "text-[#2F7D72] border-[#2F7D72] font-semibold"
                      : "text-[#5D6B6C] border-transparent hover:text-[#12191A] hover:border-[#DDE2DF]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Currency + User Profile */}
        <div className="flex items-center space-x-5">
          {/* Active Status Badge */}
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono text-[#5D6B6C] bg-[#F8FAF9] border border-[#E1E6E3] px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-[#2E8540]" />
            <span>INR (₹) · GST 18%</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-lg border border-[#E1E6E3] hover:border-[#2F7D72] bg-[#FFFFFF] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-[#E6F2F0] text-[#2F7D72] font-bold text-xs flex items-center justify-center font-mono">
                {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-semibold text-[#12191A] block leading-tight">
                  {user?.fullName || "User Account"}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#2F7D72] font-medium block">
                  {user?.role || "Staff"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#5D6B6C]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E1E6E3] rounded-lg shadow-lg py-2 z-50 text-xs">
                <div className="px-4 py-2 border-b border-[#E1E6E3]">
                  <p className="font-semibold text-[#12191A]">{user?.fullName}</p>
                  <p className="text-[11px] text-[#5D6B6C] font-mono">{user?.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#E6F2F0] text-[#2F7D72] font-bold">
                    {user?.role} Role
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/portal"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 hover:bg-[#F8FAF9] text-[#12191A]"
                  >
                    Customer Portal View
                  </Link>
                  <Link
                    href="/staff"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 hover:bg-[#F8FAF9] text-[#12191A]"
                  >
                    User Governance
                  </Link>
                </div>
                <div className="border-t border-[#E1E6E3] pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-[#D9383A] flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Secondary Nav Bar */}
      <div className="xl:hidden flex items-center space-x-5 px-8 py-2.5 overflow-x-auto border-t border-[#E1E6E3] bg-[#F8FAF9] text-xs font-medium">
        {navLinks.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap transition-colors ${
                isActive ? "text-[#2F7D72] font-semibold" : "text-[#5D6B6C] hover:text-[#12191A]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
