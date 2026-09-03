'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { tactileAudio } from '@/lib/audio';

interface StopButtonProps {
  isArmed: boolean;
  isStopping: boolean;
  filledCount: number;
  totalCategories: number;
  onStop: () => void;
}

export const StopButton: React.FC<StopButtonProps> = ({
  isArmed,
  isStopping,
  filledCount,
  totalCategories,
  onStop,
}) => {
  const handleClick = () => {
    if (!isArmed || isStopping) return;
    tactileAudio.playStopBuzzer();
    onStop();
  };

  return (
    <div className="sticky bottom-6 z-30 flex justify-center px-4 select-none">
      <motion.button
        layout
        whileTap={{ scale: isArmed && !isStopping ? 0.97 : 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        onClick={handleClick}
        disabled={!isArmed || isStopping}
        className={`rounded-full py-3.5 px-8 font-semibold text-sm transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
          isArmed && !isStopping
            ? 'bg-[#007AFF] hover:bg-[#0062CC] text-white shadow-[0_8px_30px_rgba(0,122,255,0.35)]'
            : isStopping
            ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
            : 'bg-neutral-200/70 dark:bg-neutral-800/70 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
        }`}
      >
        {isArmed && !isStopping && (
          <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        )}
        <span>
          {isStopping
            ? 'Möhlət Vaxtı Bitir...'
            : isArmed
            ? 'STOP · Yoxlamaya Keç'
            : `Doldurun (${filledCount}/${totalCategories})`}
        </span>
      </motion.button>
    </div>
  );
};
