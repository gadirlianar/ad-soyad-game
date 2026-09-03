'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AZERBAIJANI_ALPHABET } from '@/lib/constants';
import { Sparkles } from 'lucide-react';

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
    let speed = 50;
    let step = 0;
    let timer: NodeJS.Timeout;

    const roll = () => {
      const randomLetter =
        AZERBAIJANI_ALPHABET[Math.floor(Math.random() * AZERBAIJANI_ALPHABET.length)];
      setDisplayLetter(randomLetter);
      step++;

      if (step > 15 && countdownTime <= 1) {
        setDisplayLetter(targetLetter);
        setIsLocked(true);
      } else {
        speed = Math.min(speed + 12, 280); // Deceleration physics
        timer = setTimeout(roll, speed);
      }
    };

    roll();

    return () => clearTimeout(timer);
  }, [targetLetter, countdownTime]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08080a]/95 backdrop-blur-2xl">
      <div className="relative flex flex-col items-center text-center px-4 max-w-md w-full">
        {/* Subtle Ambient Radial Mesh */}
        <div className="absolute -top-32 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 h-72 w-72 rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />

        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 mb-6"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Raund {roundNumber} / Hərf Seçilir...</span>
        </motion.div>

        {/* 3D Slot Cylinder Card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: isLocked ? [1, 1.08, 1] : 1,
            opacity: 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-3xl border ${
            isLocked
              ? 'border-emerald-400/60 bg-gradient-to-b from-slate-900 via-[#0e0e14] to-slate-950 shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-500/20'
              : 'border-white/10 bg-[#0e0e14] shadow-2xl shadow-black/80'
          }`}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={displayLetter}
              initial={{ y: -30, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`font-mono text-7xl sm:text-8xl font-black select-none ${
                isLocked
                  ? 'bg-gradient-to-b from-emerald-200 via-emerald-400 to-teal-500 bg-clip-text text-transparent filter drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                  : 'text-white/80'
              }`}
            >
              {displayLetter}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Status Text / Countdown Bar */}
        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isLocked ? (
              <span className="text-emerald-400">
                &quot;{targetLetter}&quot; HƏRFİ TƏYİN EDİLDİ!
              </span>
            ) : (
              'Hərf Təyin Olunur...'
            )}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {isLocked ? 'Raund dərhal başlayır, hazır olun!' : 'Klaviatura qarşısında hazır vəziyyətdə gözləyin'}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-sm font-bold text-slate-300">
              {countdownTime > 0 ? `0${countdownTime}` : 'BAŞLADI!'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
