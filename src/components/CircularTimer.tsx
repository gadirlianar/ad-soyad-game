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
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-xl">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-xs font-bold text-emerald-300">Limitsiz (STOP)</span>
      </div>
    );
  }

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timeRemaining / totalDuration));
  const strokeDashoffset = circumference - progress * circumference;

  const isCritical = timeRemaining <= 5;
  const isWarning = timeRemaining <= 15 && !isCritical;

  const strokeColor = isCritical
    ? '#ef4444'
    : isWarning
    ? '#f59e0b'
    : '#10b981';

  return (
    <div className="relative flex items-center gap-3">
      {/* SVG Ring */}
      <div className="relative flex items-center justify-center">
        <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 54 54">
          {/* Background track */}
          <circle
            cx="27"
            cy="27"
            r={radius}
            className="stroke-white/[0.08]"
            strokeWidth="4"
            fill="transparent"
          />
          {/* Animated progress ring */}
          <motion.circle
            cx="27"
            cy="27"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{
              filter: isCritical
                ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))'
                : 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))',
            }}
          />
        </svg>

        {/* Center numbers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-mono text-xs font-black tabular-nums ${
              isCritical
                ? 'text-rose-400 animate-pulse'
                : isWarning
                ? 'text-amber-300'
                : 'text-white'
            }`}
          >
            {timeRemaining}s
          </span>
        </div>
      </div>
    </div>
  );
};
