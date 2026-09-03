'use client';

import React from 'react';
import { Eye, Clock } from 'lucide-react';

interface SpectatorBannerProps {
  currentRound: number;
}

export const SpectatorBanner: React.FC<SpectatorBannerProps> = ({ currentRound }) => {
  return (
    <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
          <Eye className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-300">Tamaşaçı Rejimi</h4>
          <p className="text-xs text-amber-200/80">
            Oyun davam etdiyi üçün bu raundu izləyirsiniz. Növbəti raundda avtomatik oyuna qoşulacaqsınız!
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
        <Clock className="h-3.5 w-3.5" />
        <span>Raund {currentRound}</span>
      </div>
    </div>
  );
};
