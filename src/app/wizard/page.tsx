"use client";

import { Suspense } from "react";
import WizardContent from "./WizardContent";

export default function WizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090a0f] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#FF542E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-mono">Loading Brand Wizard...</p>
          </div>
        </div>
      }
    >
      <WizardContent />
    </Suspense>
  );
}
