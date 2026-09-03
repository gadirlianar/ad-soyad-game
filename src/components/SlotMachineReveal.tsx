'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const letterRef = useRef(displayLetter);
  letterRef.current = displayLetter;

  useEffect(() => {
    let speed = 40;
    let step = 0;
    let timer: NodeJS.Timeout;

    const roll = () => {
      const pool = AZERBAIJANI_ALPHABET;
      const nextLetter = pool[Math.floor(Math.random() * pool.length)];
      setDisplayLetter(nextLetter);
      step++;

      // Trigger mechanical flap acoustic transient
      tactileAudio.playFlapClick(1 + (step % 5) * 0.08);

      if (step > 16 && countdownTime <= 1) {
        setDisplayLetter(targetLetter);
        setIsLocked(true);
        tactileAudio.playCountdownBeep(true);
      } else {
        speed = Math.min(speed + 14, 260); // Mechanical deceleration curve
        timer = setTimeout(roll, speed);
      }
    };

    roll();

    return () => clearTimeout(timer);
  }, [targetLetter, countdownTime]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090A0C]/95 backdrop-blur-md">
      {/* Precision Calibration Grid Lines */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[1px] w-full bg-white/[0.04]" />
        <div className="absolute h-full w-[1px] bg-white/[0.04]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xl w-full px-4">
        {/* Module Header Strip */}
        <div className="w-full max-w-sm mb-4 flex items-center justify-between border-b border-white/[0.1] pb-2 text-[10px] font-mono tracking-tracked text-zinc-400">
          <span className="flex items-center gap-2 text-white">
            <span className={`inline-block h-2 w-2 ${isLocked ? 'bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]' : 'bg-[#FF4800] animate-ping'}`} />
            <span>MOD_01 // SPLIT_FLAP_DRUM</span>
          </span>
          <span>CALIB: 0.02MM</span>
          <span>ROUND: 0{roundNumber}</span>
        </div>

        {/* Airport Split-Flap Physical Housing */}
        <div className="relative crosshair-corner border border-white/[0.12] bg-[#0E1015] p-3 shadow-2xl">
          {/* Outer Industrial Enclosure */}
          <div className="relative w-64 h-72 sm:w-80 sm:h-88 bg-[#12141A] border border-black/80 flex flex-col items-center justify-center overflow-hidden">
            {/* Top Mechanical Hinges & Rivets */}
            <div className="absolute top-2 left-3 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 border border-zinc-900" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 border border-zinc-900" />
            </div>
            <div className="absolute top-2 right-3 flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 border border-zinc-900" />
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 border border-zinc-900" />
            </div>

            {/* Split-Flap Horizontal Cleft & Shadow Divider */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex items-center">
              <div className="w-full h-[3px] bg-[#090A0C] border-y border-white/[0.06] shadow-[0px_4px_8px_rgba(0,0,0,0.8)]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1.5 bg-black border-r border-white/10" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-1.5 bg-black border-l border-white/10" />
            </div>

            {/* Monumental Glyph Display with Hairline Measurement Crosshairs */}
            <div className="relative z-10 flex items-center justify-center select-none">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={displayLetter}
                  initial={{ rotateX: 60, opacity: 0.8 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -60, opacity: 0.2 }}
                  transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                  className="relative flex items-center justify-center"
                >
                  <span
                    className={`font-display font-extrabold text-[9rem] sm:text-[11rem] leading-none tracking-tighter ${
                      isLocked ? 'text-[#D4FF00] drop-shadow-[0_0_20px_rgba(212,255,0,0.3)]' : 'text-white'
                    }`}
                  >
                    {displayLetter}
                  </span>

                  {/* Hairline Technical Overlay Over The Letter */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="h-6 w-[1px] bg-white" />
                    <div className="w-6 h-[1px] bg-white absolute" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Flap Shadow Gradient */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Corner Precision Ticks */}
            <span className="absolute bottom-2 left-3 font-mono text-[9px] text-zinc-600 tracking-widest">
              POS_Z: {isLocked ? 'LOCKED' : 'ENGAGED'}
            </span>
            <span className="absolute bottom-2 right-3 font-mono text-[9px] text-zinc-600 tracking-widest">
              STEP: {isLocked ? '00' : '0' + countdownTime}
            </span>
          </div>
        </div>

        {/* Sub-Deck Status Banner */}
        <div className="mt-6 w-full max-w-sm bg-[#12141A] border border-white/[0.08] p-3 text-center">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-tracked text-zinc-400">
            <span className="text-white font-semibold">
              {isLocked ? 'TARGET_LOCKED' : 'REEL_ROTATION_ACTIVE'}
            </span>
            <span className={isLocked ? 'text-[#D4FF00] font-bold' : 'text-[#FF4800]'}>
              T-MINUS 0{countdownTime}S
            </span>
          </div>

          <div className="mt-2 text-xs font-mono text-zinc-300">
            {isLocked ? (
              <span className="text-white font-bold tracking-wide">
                HƏDƏF HƏRF: <span className="text-[#D4FF00] font-black text-sm">&quot;{targetLetter}&quot;</span>. SÖZLƏRİ DAXİL EDİN!
              </span>
            ) : (
              <span className="text-zinc-500">Barmaqlarınızı klaviaturada hazır saxlayın...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
