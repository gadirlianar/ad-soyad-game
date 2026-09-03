'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AZERBAIJANI_ALPHABET } from '@/lib/constants';
import { tactileAudio } from '@/lib/audio';

interface SlotMachineRevealProps {
  targetLetter: string;
  roundNumber: number;
  countdownTime: number;
}

export const SlotMachineReveal: React.FC<SlotMachineRevealProps> = ({
  targetLetter,
  roundNumber,
  countdownTime,
}) => {
  const [displayLetter, setDisplayLetter] = useState('?');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let speed = 45;
    let step = 0;
    let timer: NodeJS.Timeout;

    const roll = () => {
      const pool = AZERBAIJANI_ALPHABET;
      const nextLetter = pool[Math.floor(Math.random() * pool.length)];
      setDisplayLetter(nextLetter);
      step++;

      tactileAudio.playFlapClick();

      if (step > 16 && countdownTime <= 1) {
        setDisplayLetter(targetLetter);
        setIsLocked(true);
        tactileAudio.playCountdownBeep(true);
      } else {
        speed = Math.min(speed + 12, 240);
        timer = setTimeout(roll, speed);
      }
    };

    roll();
    return () => clearTimeout(timer);
  }, [targetLetter, countdownTime]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xl px-4 select-none">
      {/* Dynamic Island Centered Fluid Pill Container */}
      <motion.div
        layout
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative bg-neutral-900/90 dark:bg-black text-white rounded-[32px] px-8 py-8 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/[0.1] max-w-xs w-full text-center"
      >
        {/* Dynamic Island Top Subtitle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-neutral-400">
            Raund {roundNumber} · Hərf Təyin Olunur
          </span>
        </div>

        {/* Monumental Display Letter with Smooth Vertical Roll */}
        <div className="h-28 flex items-center justify-center overflow-hidden my-2">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={displayLetter}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className={`font-sans font-bold text-7xl select-none ${
                isLocked ? 'text-[#34C759]' : 'text-white'
              }`}
            >
              {displayLetter}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Bottom Countdown Info */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
          <span className="text-xs font-medium text-neutral-400">
            {isLocked
              ? `"${targetLetter}" hərfi seçildi. Hazır olun!`
              : `Başlayır: 0${countdownTime}s`}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
