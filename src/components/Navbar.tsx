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
      setNotification({ type: 'success', message: `OTAQ KODU (${room.code}) KOPYALANDI` });
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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090A0C]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Hardware Brand Monogram */}
        <Link href="/" className="flex items-center gap-3 group select-none">
          <div className="flex h-8 w-8 items-center justify-center bg-[#12141A] border border-white/[0.15] font-display font-extrabold text-sm text-white group-hover:border-[#D4FF00] group-hover:text-[#D4FF00] transition-colors">
            A//S
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-xs sm:text-sm tracking-tighter text-white uppercase flex items-center gap-1.5">
              <span>AD_SOYAD</span>
              <span className="text-[9px] font-mono font-normal text-zinc-500">// DECK_4.1</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">
              NEO-INDUSTRIAL INSTRUMENT
            </span>
          </div>
        </Link>

        {/* Center: Active Room Register & Round Meter */}
        {room && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 border border-white/[0.1] bg-[#12141A] px-3 py-1 font-mono text-xs">
              <span className="text-zinc-500 text-[10px] tracking-widest">REG_ROOM:</span>
              <span className="font-bold text-[#D4FF00] tracking-widest">{room.code}</span>
              <button
                onClick={handleCopyCode}
                title="Kodu Kopyala"
                className="ml-1 p-0.5 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#D4FF00]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {room.status !== 'LOBBY' && (
              <div className="border border-white/[0.08] bg-[#161922] px-2.5 py-1 font-mono text-[10px] text-zinc-300">
                ROUND: <span className="text-white font-bold">0{room.currentRound}</span> / 0{room.settings.totalRounds}
              </div>
            )}
          </div>
        )}

        {/* Right Station: Sound Switch & Telemetry Status */}
        <div className="flex items-center gap-2">
          {/* Mobile Room Code Badge */}
          {room && (
            <button
              onClick={handleCopyCode}
              className="flex sm:hidden items-center gap-1 border border-white/[0.1] bg-[#12141A] px-2 py-1 font-mono text-[11px] font-bold text-[#D4FF00]"
            >
              <span>{room.code}</span>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}

          {/* Mechanical Audio Mute Latch */}
          <button
            onClick={handleMuteToggle}
            className={`flex h-8 w-8 items-center justify-center border transition hardware-key cursor-pointer ${
              isMuted
                ? 'border-white/[0.08] bg-[#12141A] text-zinc-500'
                : 'border-[#D4FF00]/40 bg-[#12141A] text-[#D4FF00]'
            }`}
            title={isMuted ? 'Səsi Aktivləşdir' : 'Səsi Deaktivləşdir'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Telemetry Carrier Lock Signal */}
          <div
            className="flex items-center gap-2 border border-white/[0.08] bg-[#12141A] px-2.5 py-1 font-mono text-[10px]"
            title={isConnected ? 'Carrier Locked (Active)' : 'Carrier Lost (Reconnecting)'}
          >
            <span
              className={`h-1.5 w-1.5 ${
                isConnected
                  ? 'bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]'
                  : 'bg-[#FF4800] animate-pulse'
              }`}
            />
            <span className="hidden md:inline font-semibold text-zinc-300">
              {isConnected ? 'SIGNAL: SYNC' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
