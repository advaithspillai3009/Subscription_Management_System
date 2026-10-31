"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Brightloop Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#FBF5DD]">
      <div className="max-w-md w-full bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-8 space-y-4">
        <div className="w-10 h-10 rounded-full bg-[#FEF7E0] border border-[#E7E1B1] flex items-center justify-center mx-auto text-[#B06000]">
          !
        </div>
        <h2 className="font-serif text-2xl text-[#0D530E] font-normal">
          Something went wrong
        </h2>
        <p className="text-xs text-[#0D530E]/70">
          An unexpected interface error occurred. You can retry the operation or return to the overview console.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#0D530E] hover:bg-[#146615] text-[#FBF5DD] rounded-xl text-xs font-medium transition-all"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 border border-[#D8D1A4] hover:bg-[#E7E1B1]/40 text-[#0D530E] rounded-xl text-xs font-medium transition-all"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

