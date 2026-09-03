'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, Copy, Check, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { useGameStore } from '@/lib/store';

export const Navbar: React.FC = () => {
  const { room, isConnected, isMuted, toggleMute, setNotification } = useGameStore();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setNotification({ type: 'success', message: `Otaq kodu (${room.code}) kopyalandı!` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-slate-950 shadow-lg shadow-emerald-500/20">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight sm:text-lg bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Ad, Soyad...
            </span>
            <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
              Real-time Multiplayer
            </span>
          </div>
        </Link>

        {/* Center: Room Code and Round info if in room */}
        {room && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1.5 shadow-inner">
              <span className="text-xs font-semibold text-emerald-400">Otaq Kodu:</span>
              <span className="font-mono text-sm font-bold tracking-widest text-emerald-300">
                {room.code}
              </span>
              <button
                onClick={handleCopyCode}
                title="Kodu kopyala"
                className="ml-1 rounded-md p-1 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {room.status !== 'LOBBY' && (
              <div className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
                Raund <span className="font-bold text-white">{room.currentRound}</span> / {room.settings.totalRounds}
              </div>
            )}
          </div>
        )}

        {/* Right actions: Sound, Connection */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Room Code Badge */}
          {room && (
            <button
              onClick={handleCopyCode}
              className="flex sm:hidden items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300"
            >
              <span>{room.code}</span>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 transition hover:border-white/20 hover:text-white"
            title={isMuted ? 'Səsi aç' : 'Səsi bağla'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
          </button>

          {/* Connection status indicator */}
          <div
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-2.5 py-1.5"
            title={isConnected ? 'Serverə qoşulub' : 'Serverlə əlaqə kəsilib'}
          >
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="hidden md:inline text-[11px] font-medium text-emerald-400">Canlı</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="hidden md:inline text-[11px] font-medium text-rose-400">Qoşulur...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
