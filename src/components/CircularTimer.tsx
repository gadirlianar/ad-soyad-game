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
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] text-xs font-semibold">
        <span className="h-1.5 w-1.5 rounded-full bg-[#34C759]" />
        <span>Limitsiz</span>
      </div>
    );
  }

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeRemaining / totalDuration));
  const strokeDashoffset = circumference - progress * circumference;

  const isCritical = timeRemaining <= 10;
  const strokeColor = isCritical ? '#FF3B30' : '#007AFF';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06]">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            className="stroke-neutral-200 dark:stroke-white/[0.1]"
            strokeWidth="3"
            fill="transparent"
          />
          <motion.circle
            cx="20"
            cy="20"
            r={radius}
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
      </div>

      <span
        className={`text-xs font-semibold tabular-nums ${
          isCritical ? 'text-[#FF3B30] font-bold' : 'text-neutral-800 dark:text-neutral-200'
        }`}
      >
        {timeRemaining}s
      </span>
    </div>
  );
};
