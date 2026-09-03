'use client';

import React from 'react';
import { Eye } from 'lucide-react';

interface SpectatorBannerProps {
  currentRound: number;
}

export const SpectatorBanner: React.FC<SpectatorBannerProps> = ({ currentRound }) => {
  return (
    <div className="w-full max-w-2xl mb-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] p-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <Eye className="h-3.5 w-3.5" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            İzləyici Rejimi
          </h4>
          <p className="text-[11px] text-neutral-400">
            Aktiv raund bitdikdən sonra avtomatik olaraq növbəti raunda qoşulacaqsınız.
          </p>
        </div>
      </div>
      <span className="text-xs font-medium text-neutral-500 tabular-nums">
        Raund {currentRound}
      </span>
    </div>
  );
};
