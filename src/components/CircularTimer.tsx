'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
  timeRemaining: number;
  totalDuration: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  timeRemaining,
  totalDuration,
}) => {
  if (totalDuration <= 0) {
    return (
      <div className="flex items-center gap-2 border border-white/[0.1] bg-[#12141A] px-3 py-1.5 font-mono text-[11px] tracking-tracked text-zinc-300">
        <span className="h-1.5 w-1.5 rounded-none bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]" />
        <span className="text-white font-bold uppercase">MODE: UNRESTRICTED_STOP</span>
      </div>
    );
  }

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeRemaining / totalDuration));
  const strokeDashoffset = circumference - progress * circumference;

  const isCritical = timeRemaining <= 10;
  const strokeColor = isCritical ? '#FF4800' : '#D4FF00';

  return (
    <div className="flex items-center gap-3 bg-[#0E1015] border border-white/[0.1] p-2 pl-3">
      <div className="flex flex-col text-left font-mono">
        <span className="text-[9px] uppercase tracking-tracked text-zinc-500">CHRONO_CLOCK</span>
        <span
          className={`text-xl font-bold font-mono tracking-tight tabular-nums ${
            isCritical ? 'text-[#FF4800] animate-pulse' : 'text-white'
          }`}
        >
          {timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}
          <span className="text-[10px] text-zinc-500 ml-0.5">SEC</span>
        </span>
      </div>

      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 60 60">
          {/* Hairline background track */}
          <circle
            cx="30"
            cy="30"
            r={radius}
            className="stroke-white/[0.08]"
            strokeWidth="3"
            fill="transparent"
          />
          {/* Active indicator ring */}
          <motion.circle
            cx="30"
            cy="30"
            r={radius}
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinecap="square"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{
              filter: isCritical
                ? 'drop-shadow(0 0 6px rgba(255, 72, 0, 0.8))'
                : 'drop-shadow(0 0 4px rgba(212, 255, 0, 0.4))',
            }}
          />
        </svg>

        {/* Center Target Cross */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-1 w-1 bg-white/20" />
        </div>
      </div>
    </div>
  );
};
