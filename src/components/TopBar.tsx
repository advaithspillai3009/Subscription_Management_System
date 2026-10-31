"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, User, Shield } from "lucide-react";

export default function TopBar() {
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
            fullName: "Alex Rivera",
            role: "admin",
            email: "alex@brightloop.software",
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  // Compute breadcrumb path
  const getBreadcrumb = () => {
    if (pathname === "/") return "OVERVIEW";
    const segment = pathname.split("/")[1] || "OVERVIEW";
    return segment.toUpperCase().replace("-", " ");
  };

  return (
    <header className="w-full bg-[#FBF5DD] border-b border-[#D8D1A4] px-8 h-14 flex items-center justify-between">
      {/* Breadcrumb matching Reference A */}
      <div className="flex items-center space-x-2 text-[11px] font-mono tracking-widest text-[#0D530E] uppercase font-semibold">
        <span>WORKSPACE</span>
        <span className="text-[#0D530E]/50">/</span>
        <span>{getBreadcrumb()}</span>
      </div>

      {/* User Avatar & Dropdown */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center space-x-1.5 p-1 rounded-full hover:opacity-85 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-[#0D530E] text-[#FBF5DD] font-bold text-xs flex items-center justify-center font-sans">
            {user?.fullName ? user.fullName[0].toUpperCase() : "A"}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#0D530E]" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-[#FBF5DD] border border-[#D8D1A4] rounded-lg shadow-lg py-2 z-50 text-xs">
            <div className="px-4 py-2 border-b border-[#D8D1A4]">
              <p className="font-semibold text-[#0D530E]">{user?.fullName}</p>
              <p className="text-[11px] text-[#0D530E]/70 font-mono">{user?.email}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#E7E1B1] text-[#0D530E] font-bold">
                {user?.role} Role
              </span>
            </div>

            <div className="py-1">
              <Link
                href="/portal"
                onClick={() => setProfileOpen(false)}
                className="block px-4 py-2 hover:bg-[#E7E1B1] text-[#0D530E]"
              >
                Customer Portal View
              </Link>
              <Link
                href="/staff"
                onClick={() => setProfileOpen(false)}
                className="block px-4 py-2 hover:bg-[#E7E1B1] text-[#0D530E]"
              >
                User Governance
              </Link>
            </div>

            <div className="border-t border-[#D8D1A4] pt-1">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-[#F4ECD0] text-[#B34A3E] flex items-center space-x-2 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

