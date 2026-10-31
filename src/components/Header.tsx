"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User as UserIcon, LogOut, Shield, ChevronDown } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [themeSide, setThemeSide] = useState<"A" | "B">("B");
  const [user, setUser] = useState<{ fullName: string; role: string; email: string } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    // Fetch current user profile
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          // Default demo profile for immediate hackathon exploration
          setUser({
            fullName: "Advaith Pillai",
            role: "admin",
            email: "admin@brightloop.software",
          });
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = themeSide === "B" ? "A" : "B";
    setThemeSide(next);
    if (next === "A") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  return (
    <header className="w-full border-b border-[#E1E6E3] bg-[#F8FAF9]/95 backdrop-blur sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-[1680px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo in haru/studio typography signature format */}
        <div className="flex items-center space-x-8">
          <Link className="group flex items-baseline tracking-tight" href="/">
            <span className="text-2xl font-bold tracking-tight text-[#111819] font-display">
              brightloop
            </span>
            <span className="text-2xl text-[#2F7D72] font-light mx-1">/</span>
            <span className="text-2xl font-normal text-[#5D6B6C] group-hover:text-[#111819] transition-colors font-display">
              software
            </span>
            <span className="text-[10px] text-[#2F7D72] font-mono ml-1 font-semibold">®</span>
          </Link>

          {/* Primary Top Navigation */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium">
            <Link
              className={`relative py-1 flex flex-col items-center transition-colors ${
                pathname === "/" ? "text-[#111819] font-semibold" : "text-[#5D6B6C] hover:text-[#111819]"
              }`}
              href="/"
            >
              <span>Overview</span>
              {pathname === "/" && <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D72] mt-1" />}
            </Link>

            <Link
              className={`transition-colors ${
                pathname.startsWith("/subscriptions")
                  ? "text-[#111819] font-semibold"
                  : "text-[#5D6B6C] hover:text-[#111819]"
              }`}
              href="/subscriptions"
            >
              Subscriptions
            </Link>

            <Link
              className={`transition-colors ${
                pathname.startsWith("/products")
                  ? "text-[#111819] font-semibold"
                  : "text-[#5D6B6C] hover:text-[#111819]"
              }`}
              href="/products"
            >
              Products & Variants
            </Link>

            <Link
              className={`transition-colors ${
                pathname.startsWith("/invoices")
                  ? "text-[#111819] font-semibold"
                  : "text-[#5D6B6C] hover:text-[#111819]"
              }`}
              href="/invoices"
            >
              Invoices
            </Link>

            <Link
              className={`transition-colors ${
                pathname.startsWith("/customers")
                  ? "text-[#111819] font-semibold"
                  : "text-[#5D6B6C] hover:text-[#111819]"
              }`}
              href="/customers"
            >
              Customers
            </Link>

            <Link
              className={`transition-colors ${
                pathname.startsWith("/portal")
                  ? "text-[#111819] font-semibold"
                  : "text-[#5D6B6C] hover:text-[#111819]"
              }`}
              href="/portal"
            >
              Customer Portal
            </Link>
          </nav>
        </div>

        {/* Right Header Actions & Status Pill */}
        <div className="flex items-center space-x-5">
          {/* Live AI Status Pill with Sage Teal Indicator */}
          <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E1E6E3] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#2F7D72] animate-pulse-subtle" />
            <span className="font-mono text-[11px] tracking-wider font-semibold text-[#2F7D72] uppercase">
              ORION AI // ACTIVE
            </span>
            <span className="text-[#E1E6E3]">|</span>
            <span className="font-mono text-[10px] text-[#5D6B6C]">LATENCY 14ms</span>
          </div>

          {/* Quick Search Bar (Cmd+K) */}
          <div className="relative hidden sm:block">
            <input
              className="bg-[#FFFFFF] border border-[#E1E6E3] text-xs text-[#111819] placeholder-[#5D6B6C]/60 rounded-lg pl-8 pr-12 py-2 focus:outline-none focus:border-[#2F7D72] focus:ring-1 focus:ring-[#2F7D72] transition-all w-60 xl:w-72"
              placeholder="Search subscriptions, INR invoices..."
              type="text"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#5D6B6C]" />
            <kbd className="absolute right-2.5 top-2 font-mono text-[10px] text-[#5D6B6C] bg-[#F3F5F4] px-1.5 py-0.5 rounded border border-[#E1E6E3]">
              ⌘K
            </kbd>
          </div>

          {/* Currency Selector INR (₹) */}
          <div className="flex items-center text-xs font-mono bg-[#FFFFFF] border border-[#E1E6E3] rounded-lg px-2.5 py-1.5 text-[#5D6B6C]">
            <span className="text-[#2F7D72] font-bold mr-1">INR (₹)</span>
            <span className="text-[10px] text-[#5D6B6C]/70">· IN</span>
          </div>

          {/* Tactile Cassette Theme Switcher from Stitch Reference */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#E1E6E3]">
            <button
              className="flex items-center space-x-2.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#E1E6E3] rounded-md hover:border-[#2F7D72]/60 hover:shadow-sm transition-all group"
              onClick={toggleTheme}
              title="Toggle Side A (Dark) / Side B (Light)"
              type="button"
            >
              {/* Micro Cassette Icon */}
              <div className="w-7 h-4 bg-[#111819] border border-[#2F4045] rounded-xs p-0.5 flex flex-col justify-between shadow-xs">
                <div className="h-1 bg-[#2F7D72]/60 rounded-2xs flex items-center justify-between px-0.5">
                  <span className="w-0.5 h-0.5 rounded-full bg-[#FFFFFF]" />
                  <span className="text-[5px] font-mono text-[#FFFFFF] leading-none">
                    {themeSide}
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-[#FFFFFF]" />
                </div>
              </div>
              <span className="text-xs font-mono text-[#111819] font-medium">
                SIDE {themeSide} · {themeSide === "B" ? "Light" : "Dark"}
              </span>
            </button>
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-1.5 rounded-lg border border-[#E1E6E3] bg-[#FFFFFF] hover:border-[#2F7D72] transition-colors"
              onClick={() => setProfileOpen(!profileOpen)}
              type="button"
            >
              <div className="w-7 h-7 rounded bg-[#12191A] text-white flex items-center justify-center font-mono text-xs font-bold">
                {user ? user.fullName.charAt(0) : "A"}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#111819] leading-tight">
                  {user ? user.fullName : "User"}
                </span>
                <span className="text-[10px] font-mono uppercase text-[#2F7D72] leading-none">
                  {user ? user.role : "Guest"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#5D6B6C]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E1E6E3] rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-[#E1E6E3]">
                  <p className="text-xs font-semibold text-[#111819]">{user?.fullName}</p>
                  <p className="text-[11px] text-[#5D6B6C] font-mono">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#2F7D72]/10 text-[#2F7D72] rounded">
                    ROLE: {user?.role.toUpperCase()}
                  </span>
                </div>

                <Link
                  className="flex items-center space-x-2 px-4 py-2 text-xs text-[#111819] hover:bg-[#F3F5F4] transition-colors"
                  href="/portal"
                  onClick={() => setProfileOpen(false)}
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#5D6B6C]" />
                  <span>Customer Self-Service</span>
                </Link>

                <Link
                  className="flex items-center space-x-2 px-4 py-2 text-xs text-[#111819] hover:bg-[#F3F5F4] transition-colors"
                  href="/staff"
                  onClick={() => setProfileOpen(false)}
                >
                  <Shield className="w-3.5 h-3.5 text-[#5D6B6C]" />
                  <span>Staff & Roles Governance</span>
                </Link>

                <button
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-[#E1E6E3] mt-1"
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
