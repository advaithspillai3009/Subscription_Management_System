import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import PennyMascot from "@/components/PennyMascot";

export const metadata: Metadata = {
  title: "Brightloop — Subscription Management System",
  description:
    "Unified B2B Subscription Management, Automated Idempotent Billing, and Financial Telemetry Platform.",
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
      </head>
      <body className="min-h-screen flex flex-col bg-[#F8FAF9] text-[#12191A] antialiased selection:bg-[#2F7D72] selection:text-[#FFFFFF]">
        {/* Unified Application Header */}
        <Header />

        {/* Main Application Container with generous spacing */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-8 py-8">
          {children}
        </main>

        {/* Floating Contextual Helper Mascot */}
        <PennyMascot initialMood="IDLE_CHEERFUL" />

        {/* Clean SaaS Footer */}
        <footer className="w-full border-t border-[#E1E6E3] bg-[#FFFFFF] py-6 text-xs text-[#5D6B6C]">
          <div className="max-w-[1600px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-[#2F7D72]" />
              <span className="font-semibold text-[#12191A]">Brightloop Subscription Management Platform</span>
              <span>·</span>
              <span>GST 18% Compliant</span>
            </div>

            <div className="flex items-center space-x-6 text-[11px] font-mono">
              <span>Automated Billing Engine</span>
              <span>·</span>
              <span>Zero-Duplicate Idempotency Enforced</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
