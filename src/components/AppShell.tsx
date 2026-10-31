"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  if (isAuthRoute) {
    return <main className="min-h-screen bg-[#FBF5DD] text-[#0D530E]">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#FBF5DD] text-[#0D530E] flex">
      {/* Deep Forest Green Sidebar (#0D530E) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-60">
        <TopBar />
        <main className="flex-1 p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

