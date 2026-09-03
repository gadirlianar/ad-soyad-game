'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@/types/game';

interface HeaderStatusProps {
  currentLetter: string;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  totalDuration: number;
  players: Player[];
  currentPlayerId: string;
  playerAnswers: Record<string, Record<string, string>>;
  totalCategories: number;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  currentLetter,
  currentRound,
  totalRounds,
  timeRemaining,
  totalDuration,
  players,
  currentPlayerId,
  playerAnswers,
  totalCategories,
}) => {
  const isCritical = timeRemaining <= 10 && totalDuration > 0;
  const progressPercent = totalDuration > 0 ? Math.max(0, timeRemaining / totalDuration) : 1;

  return (
    <div className="w-full flex flex-col items-center gap-4 mb-8 select-none">
      {/* Dynamic Island Pill Container */}
      <motion.div
        layout
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="apple-glass rounded-full px-5 py-2.5 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]"
      >
        {/* Left: Round Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
            Raund
          </span>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            {currentRound} / {totalRounds}
          </span>
        </div>

        {/* Center: Dynamic Island Active Letter Bubble */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/[0.08]">
          <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Hərf
          </span>
          <motion.span
            key={currentLetter}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="text-base font-bold text-neutral-900 dark:text-white"
          >
            {currentLetter}
          </motion.span>
        </div>

        {/* Right: Apple Health Style Circular Countdown */}
        <div className="flex items-center gap-2.5">
          {totalDuration > 0 ? (
            <>
              <div className="relative h-5 w-5 flex items-center justify-center">
                <svg className="h-5 w-5 -rotate-90 transform" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    className="stroke-neutral-200 dark:stroke-white/[0.1]"
                    strokeWidth="2.5"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke={isCritical ? '#FF3B30' : '#007AFF'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 9}
                    animate={{
                      strokeDashoffset: (2 * Math.PI * 9) * (1 - progressPercent),
                    }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </svg>
              </div>
              <span
                className={`text-xs font-semibold tabular-nums ${
                  isCritical
                    ? 'text-[#FF3B30] font-bold'
                    : 'text-neutral-800 dark:text-neutral-200'
                }`}
              >
                {timeRemaining}s
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-[#34C759]">Limitsiz</span>
          )}
        </div>
      </motion.div>

      {/* Live Player Presence Horizontal Capsule Row */}
      {players.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1">
          {players.map((p) => {
            const isMe = p.id === currentPlayerId;
            const pAnswers = playerAnswers[p.id] || {};
            const filledCount = Object.values(pAnswers).filter((v) => (v || '').trim().length > 0).length;
            const isCompleted = filledCount === totalCategories && totalCategories > 0;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors ${
                  isMe
                    ? 'bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.08]'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="relative">
                  <span className="text-sm">{p.avatar}</span>
                  {/* Validation status dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-white dark:border-neutral-900 ${
                      isCompleted ? 'bg-[#34C759]' : filledCount > 0 ? 'bg-[#007AFF]' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 max-w-[80px] truncate leading-tight">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                    {filledCount}/{totalCategories}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
