'use client';

import React from 'react';
import { Eye } from 'lucide-react';

interface SpectatorBannerProps {
  currentRound: number;
}

export const SpectatorBanner: React.FC<SpectatorBannerProps> = ({ currentRound }) => {
  return (
    <div className="mb-6 flex items-center justify-between border border-amber-500/40 bg-[#0E1015] p-3 font-mono">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Eye className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-tracked">
            STATUS: SPECTATOR_PASSIVE // OBSERVER_MODE
          </h4>
          <p className="text-[11px] text-zinc-400">
            Aktiv raund davam edir. Növbəti raund (0{currentRound + 1}) başladığında avtomatik daxil olacaqsınız.
          </p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 border border-white/[0.1] bg-[#12141A] px-2.5 py-1 text-[10px] text-zinc-400">
        <span>CURRENT_ROUND: 0{currentRound}</span>
      </div>
    </div>
  );
};
