'use client';

import React, { useRef } from 'react';
import { Category } from '@/types/game';
import { startsWithLetter } from '@/lib/gameLogic';
import { tactileAudio } from '@/lib/audio';

interface GameInputDeckProps {
  categories: Category[];
  currentLetter: string;
  localAnswers: Record<string, string>;
  disabled: boolean;
  onAnswerChange: (categoryId: string, value: string) => void;
}

export const GameInputDeck: React.FC<GameInputDeckProps> = ({
  categories,
  currentLetter,
  localAnswers,
  disabled,
  onAnswerChange,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index + 1 < categories.length) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      {categories.map((cat, idx) => {
        const val = localAnswers[cat.id] || '';
        const isValid = startsWithLetter(val, currentLetter);
        const hasText = val.trim().length > 0;

        return (
          <div
            key={cat.id}
            onClick={() => inputRefs.current[idx]?.focus()}
            className="group rounded-2xl bg-white/70 dark:bg-[#161618]/70 border border-black/[0.04] dark:border-white/[0.06] p-4 transition-all duration-200 hover:border-black/[0.1] dark:hover:border-white/[0.12] focus-within:ring-2 focus-within:ring-[#007AFF]/30 focus-within:border-[#007AFF]/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] cursor-text"
          >
            {/* Field Header */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 tracking-normal">
                {cat.azLabel}
              </span>

              {/* Soft Emerald Compliance Dot Indicator */}
              <div className="flex items-center gap-1.5 h-4">
                {hasText && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      isValid
                        ? 'bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.5)]'
                        : 'bg-[#FF3B30]'
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Native Borderless Text Entry */}
            <input
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              disabled={disabled}
              placeholder={`"${currentLetter}" hərfi ilə...`}
              value={val}
              onFocus={() => tactileAudio.playFocusClick()}
              onChange={(e) => {
                tactileAudio.playKeyStroke();
                onAnswerChange(cat.id, e.target.value);
              }}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-full bg-transparent text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none tracking-normal caret-[#007AFF]"
            />
          </div>
        );
      })}
    </div>
  );
};
