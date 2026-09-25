"use client";

import { Suspense } from "react";
import WizardContent from "./WizardContent";

export default function WizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06070a] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#FF542E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Initializing BrandOS Studio...
            </p>
          </div>
        </div>
      }
    >
      <WizardContent />
    </Suspense>
  );
}
