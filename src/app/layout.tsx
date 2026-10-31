import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import SubNav from "@/components/SubNav";
import PennyMascot from "@/components/PennyMascot";

export const metadata: Metadata = {
  title: "brightloop / software — AI-Powered Subscription Engine",
  description:
    "Unified B2B Subscription Management, Automated Idempotent Billing, and Financial Intelligence Platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#111819] selection:bg-[#2F7D72] selection:text-[#FFFFFF]">
        {/* Global Application Shell Header */}
        <Header />

        {/* Horizontal Navigation Strip */}
        <SubNav />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-[1680px] mx-auto px-6 py-8">
          {children}
        </main>

        {/* Global Penny Mascot Widget */}
        <PennyMascot initialMood="IDLE_CHEERFUL" />

        {/* Studio Craft Micro-Footer */}
        <footer className="w-full border-t border-[#E1E6E3] bg-[#F8FAF9] py-6 text-xs font-mono text-[#5D6B6C]">
          <div className="max-w-[1680px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-[#2F7D72]" />
              <span className="font-semibold text-[#111819]">brightloop / software ®</span>
              <span>·</span>
              <span>定期課金管理基盤</span>
              <span>·</span>
              <span>NODE-BLR-04</span>
            </div>

            <div className="flex items-center space-x-6 text-[11px]">
              <span>TELEMETRY: <strong className="text-[#2F7D72]">14ms</strong></span>
              <span>COORDINATES: <strong>35°40&apos; N 139°45&apos; E</strong></span>
              <span>B2B INR REGION ACTIVE</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
