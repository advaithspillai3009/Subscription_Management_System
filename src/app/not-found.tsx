import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF5DD] text-[#0D530E] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#E7E1B1]/50 border border-[#D8D1A4] flex items-center justify-center mx-auto text-[#0D530E] font-serif text-xl">
          404
        </div>
        <h2 className="font-serif text-2xl font-normal text-[#0D530E]">Page Not Found</h2>
        <p className="text-xs text-[#0D530E]/70">
          The requested page could not be located in the subscription workspace.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl text-xs font-medium transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
