"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FBF5DD] text-[#0D530E] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#FBF5DD] border border-[#D8D1A4] rounded-2xl p-8 text-center space-y-4">
          <h2 className="font-serif text-2xl font-normal">Application Notice</h2>
          <p className="text-xs opacity-75">
            A temporary system error was encountered. Click below to reload.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#0D530E] text-[#FBF5DD] rounded-xl text-xs font-medium"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}

