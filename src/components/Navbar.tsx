'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { tactileAudio } from '@/lib/audio';

export const Navbar: React.FC = () => {
  const { room, isConnected, isMuted, toggleMute, setNotification } = useGameStore();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      tactileAudio.playKeyStroke();
      setNotification({ type: 'success', message: `Otaq kodu (${room.code}) kopyalandı` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleMuteToggle = () => {
    toggleMute();
    tactileAudio.playKeyStroke();
  };

  return (
    <header className="sticky top-0 z-40 w-full apple-glass border-b border-black/[0.04] dark:border-white/[0.06] transition-colors">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group select-none">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs transition-transform group-hover:scale-105">
            A
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
            Ad, Soyad
          </span>
        </Link>

        {/* Center Room Code Pill */}
        {room && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
            >
              <span>{room.code}</span>
              {copied ? <Check className="h-3 w-3 text-[#34C759]" /> : <Copy className="h-3 w-3 text-neutral-400" />}
            </button>
            {room.status !== 'LOBBY' && (
              <span className="hidden sm:inline text-xs text-neutral-400">
                Raund {room.currentRound}/{room.settings.totalRounds}
              </span>
            )}
          </div>
        )}

        {/* Right Station: Sound Switch & Connection Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMuteToggle}
            className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition cursor-pointer"
            title={isMuted ? 'Səsi Aç' : 'Səsi Bağla'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-neutral-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
            title={isConnected ? 'Serverə qoşulub' : 'Qoşulur...'}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected ? 'bg-[#34C759]' : 'bg-[#FF9500] animate-pulse'
              }`}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
