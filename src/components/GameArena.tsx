'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { startsWithLetter } from '@/lib/gameLogic';
import { tactileAudio } from '@/lib/audio';
import { SpectatorBanner } from './SpectatorBanner';
import { SlotMachineReveal } from './SlotMachineReveal';
import { CircularTimer } from './CircularTimer';

export const GameArena: React.FC = () => {
  const {
    room,
    playerId,
    localAnswers,
    updateLocalAnswer,
    clearLocalAnswers,
    setNotification,
    sendGameAction,
  } = useGameStore();

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeBayIndex, setActiveBayIndex] = useState<number | null>(0);
  const [shockwave, setShockwave] = useState(false);

  const isSpectator = room?.players[playerId]?.isSpectator;
  const currentLetter = room?.currentLetter || 'A';
  const categories = room?.settings.categories || [];
  const roundDuration = room?.settings.roundDuration || 60;
  const timeRemaining = room?.roundTimeRemaining ?? roundDuration;
  const graceRemaining = room?.graceTimeRemaining;
  const stoppedBy = room?.stoppedBy;

  // Auto-focus first channel bay on start
  useEffect(() => {
    if (room?.status === 'PLAYING' && !isSpectator) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 250);
    }
  }, [room?.status, isSpectator]);

  // Reset local answers on countdown
  useEffect(() => {
    if (room?.status === 'COUNTDOWN') {
      clearLocalAnswers();
    }
  }, [room?.status, clearLocalAnswers]);

  // Trigger tactile shockwave when STOP is smashed
  useEffect(() => {
    if (graceRemaining !== null) {
      setShockwave(true);
      const t = setTimeout(() => setShockwave(false), 900);
      return () => clearTimeout(t);
    }
  }, [graceRemaining]);

  if (!room) return null;

  // 3D Split-Flap Letter Reel on COUNTDOWN
  if (room.status === 'COUNTDOWN') {
    return (
      <SlotMachineReveal
        targetLetter={room.currentLetter || 'A'}
        roundNumber={room.currentRound}
        countdownTime={room.countdownTime}
      />
    );
  }

  const filledCount = categories.filter((c) => (localAnswers[c.id] || '').trim().length > 0).length;
  const allFieldsFilled = filledCount === categories.length && categories.length > 0;
  const isStopping = graceRemaining !== null;

  const handleInputChange = (catId: string, val: string) => {
    if (isSpectator || (isStopping && graceRemaining === 0)) return;
    tactileAudio.playKeyStroke();
    updateLocalAnswer(catId, val);
  };

  const handleInputFocus = (index: number) => {
    setActiveBayIndex(index);
    tactileAudio.playFocusClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index + 1 < categories.length) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleStopButton = () => {
    if (!allFieldsFilled) {
      setNotification({
        type: 'warning',
        message: `BÜTÜN KANALLARI DOLDURUN: (${filledCount}/${categories.length})`,
      });
      return;
    }
    tactileAudio.playStopBuzzer();
    sendGameAction('stop');
  };

  const otherPlayers = Object.values(room.players).filter((p) => p.id !== playerId && !p.isSpectator);

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 relative">
      {/* Visual Shockwave Pulse on STOP smash */}
      {shockwave && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-[#FF4800]/20 mix-blend-screen animate-pulse" />
      )}

      {isSpectator && <SpectatorBanner currentRound={room.currentRound} />}

      {/* Top Deck: Machined Telemetry Header Bar */}
      <div className="border border-white/[0.1] bg-[#0E1015] p-4 sm:p-5 mb-6 crosshair-corner">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Target Register Block */}
          <div className="flex items-center gap-5">
            <div className="relative crosshair-corner border-2 border-white/[0.15] bg-[#12141A] p-2">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center bg-[#090A0C] border border-black">
                <span className="font-display font-extrabold text-5xl sm:text-6xl text-[#D4FF00] drop-shadow-[0_0_12px_rgba(212,255,0,0.4)]">
                  {currentLetter}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-tracked text-zinc-500 mb-1">
                <span className="inline-block h-1.5 w-1.5 bg-[#D4FF00]" />
                <span>REGISTER_TARGET // ROUND 0{room.currentRound} OF 0{room.settings.totalRounds}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase">
                &quot;{currentLetter}&quot; İLƏ KANALLARI DOLDURUN
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                ENTER / TAB İLƏ NÖVBƏTİ KANALA KEÇİN
              </p>
            </div>
          </div>

          {/* Right: Live Opponent Telemetry & Cockpit Timer */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            {/* Live Opponent Waveform & LED Progress Strips */}
            {otherPlayers.length > 0 && (
              <div className="flex items-center gap-2 border border-white/[0.08] bg-[#090A0C] p-2">
                <div className="text-[9px] font-mono tracking-tracked text-zinc-500 pr-2 border-r border-white/[0.08] hidden sm:block">
                  RADAR_P2P
                </div>
                {otherPlayers.map((p) => {
                  const pAnswers = room.answers[p.id] || {};
                  const pFilled = Object.values(pAnswers).filter((v) => (v || '').trim().length > 0).length;
                  const isDone = pFilled === categories.length && categories.length > 0;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 border border-white/[0.06] bg-[#12141A] px-2.5 py-1"
                      title={`${p.name}: ${pFilled}/${categories.length} dolu`}
                    >
                      <span className="text-sm">{p.avatar}</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-semibold text-zinc-300 max-w-[80px] truncate">
                            {p.name}
                          </span>
                          <span className="font-mono text-[9px] text-[#D4FF00]">
                            {16 + (p.name.length % 5)}ms
                          </span>
                        </div>

                        {/* 7-Segment Hardware LED Meter */}
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {categories.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 w-2 ${
                                i < pFilled
                                  ? isDone
                                    ? 'bg-[#FF4800] shadow-[0_0_4px_#FF4800]'
                                    : 'bg-[#D4FF00]'
                                  : 'bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Equalizer Waveform Animation */}
                      <div className="flex items-end gap-0.5 h-4 ml-1">
                        <span className={`w-0.5 bg-[#D4FF00] ${pFilled > 0 ? 'animate-bounce' : 'h-1'}`} style={{ height: pFilled > 0 ? '12px' : '3px' }} />
                        <span className={`w-0.5 bg-[#D4FF00] ${pFilled > 0 ? 'animate-pulse' : 'h-1'}`} style={{ height: pFilled > 0 ? '16px' : '2px' }} />
                        <span className={`w-0.5 bg-[#D4FF00] ${pFilled > 0 ? 'animate-bounce' : 'h-1'}`} style={{ height: pFilled > 0 ? '9px' : '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cockpit Chrono Timer */}
            <CircularTimer timeRemaining={timeRemaining} totalDuration={roundDuration} />
          </div>
        </div>

        {/* STOP Grace Period Banner */}
        <AnimatePresence>
          {isStopping && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-2 border-[#FF4800] bg-[#FF4800]/10 p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 bg-[#FF4800] animate-ping" />
                <span className="font-mono font-black text-white text-sm sm:text-base tracking-wider uppercase">
                  🚨 {stoppedBy?.name} STOP KƏSİNTİSİNİ AKTİVLƏŞDİRDİ!
                </span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-[#FF4800] bg-black px-3 py-1 border border-[#FF4800]">
                MÖHLƏT: {graceRemaining} SANİYƏ
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Rack: Modular Synth Channel Strips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {categories.map((cat, idx) => {
          const currentVal = localAnswers[cat.id] || '';
          const hasInput = currentVal.trim().length > 0;
          const isCorrectLetter = startsWithLetter(currentVal, currentLetter);
          const isInvalidStart = hasInput && !isCorrectLetter;
          const isActiveBay = activeBayIndex === idx;

          return (
            <div
              key={cat.id}
              onClick={() => inputRefs.current[idx]?.focus()}
              className={`group relative bg-[#12141A] border p-4 transition-all duration-100 cursor-text ${
                isActiveBay
                  ? 'border-[#D4FF00] shadow-[0_0_15px_rgba(212,255,0,0.15)] bg-[#151821]'
                  : isInvalidStart
                  ? 'border-[#FF4800]/60 bg-[#161214]'
                  : isCorrectLetter
                  ? 'border-[#D4FF00]/40 bg-[#121614]'
                  : 'border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              {/* Corner Bracket Highlights for Active Bay */}
              {isActiveBay && (
                <>
                  <span className="absolute top-0 left-0 font-mono text-[9px] text-[#D4FF00] leading-none select-none p-1">┌</span>
                  <span className="absolute top-0 right-0 font-mono text-[9px] text-[#D4FF00] leading-none select-none p-1">┐</span>
                  <span className="absolute bottom-0 left-0 font-mono text-[9px] text-[#D4FF00] leading-none select-none p-1">└</span>
                  <span className="absolute bottom-0 right-0 font-mono text-[9px] text-[#D4FF00] leading-none select-none p-1">┘</span>
                </>
              )}

              {/* Bay Top Header Strip */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                <div className="flex items-center gap-2 font-mono text-[10px] tracking-tracked text-zinc-400">
                  <span className="text-white font-bold">BAY_0{idx + 1}</span>
                  <span>//</span>
                  <span className="text-zinc-300 font-semibold">{cat.azLabel.toUpperCase()}</span>
                  {cat.isCustom && (
                    <span className="bg-[#FF4800]/20 text-[#FF4800] px-1 text-[8px] font-mono font-bold">
                      CUSTOM
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-zinc-500 tabular-nums">
                    LEN: {currentVal.length < 10 ? `0${currentVal.length}` : currentVal.length}
                  </span>

                  {/* Tri-State LED Compliance Status */}
                  <div className="flex items-center gap-1 pl-1">
                    <span
                      className={`h-2 w-2 ${
                        isInvalidStart
                          ? 'bg-[#FF4800] shadow-[0_0_8px_#FF4800]'
                          : isCorrectLetter
                          ? 'bg-[#D4FF00] shadow-[0_0_8px_#D4FF00]'
                          : 'bg-zinc-700'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* High-Contrast Large Monospaced Input */}
              <div className="relative flex items-center">
                <input
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  disabled={isSpectator || (isStopping && graceRemaining === 0)}
                  placeholder={`"${currentLetter}" İLƏ...`}
                  value={currentVal}
                  onFocus={() => handleInputFocus(idx)}
                  onChange={(e) => handleInputChange(cat.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-full bg-transparent font-mono text-xl sm:text-2xl font-bold text-white placeholder-zinc-700 focus:outline-none tracking-tight selection:bg-[#FF4800] selection:text-black"
                />
              </div>

              {/* Bottom Hairline Status Signal */}
              <div className="mt-3 flex items-center justify-between text-[9px] font-mono pt-1.5 border-t border-white/[0.04]">
                <span className="text-zinc-500">
                  REQ: CHAR_01 == &apos;{currentLetter}&apos;
                </span>
                <span
                  className={`font-semibold ${
                    isInvalidStart
                      ? 'text-[#FF4800]'
                      : isCorrectLetter
                      ? 'text-[#D4FF00]'
                      : 'text-zinc-600'
                  }`}
                >
                  {isInvalidStart
                    ? 'ERR // NON_COMPLIANT'
                    : isCorrectLetter
                    ? 'ACK // VALID_SIGNAL'
                    : 'AWAITING_INPUT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Industrial Emergency Cutoff "STOP" Station */}
      {!isSpectator && (
        <div className="sticky bottom-6 z-30 flex flex-col items-center">
          {/* Warning-Striped Outer Safety Chassis */}
          <div className="w-full max-w-lg p-2 bg-[#090A0C] border-2 border-black shadow-2xl hazard-stripes">
            <div className="bg-[#0E1015] p-2 border border-white/[0.1] flex flex-col items-center">
              <div className="w-full flex items-center justify-between px-2 mb-2 font-mono text-[9px] tracking-tracked text-zinc-400">
                <span>CUTOFF_INTERLOCK // SYS_07</span>
                <span className={allFieldsFilled && !isStopping ? 'text-[#D4FF00] font-bold' : 'text-zinc-600'}>
                  {allFieldsFilled ? 'SAFETY_RELEASED' : 'INTERLOCK_LOCKED'}
                </span>
              </div>

              {/* Physical Push-Down Mechanical Switch */}
              <button
                type="button"
                onClick={handleStopButton}
                disabled={!allFieldsFilled || isStopping}
                className={`w-full py-4 px-6 font-mono font-black tracking-tracked text-center transition-all cursor-pointer select-none flex items-center justify-center gap-3 ${
                  allFieldsFilled && !isStopping
                    ? 'stop-cutoff-armed animate-pulse text-black text-xl sm:text-2xl uppercase'
                    : 'bg-[#181B22] text-zinc-600 border border-white/[0.06] cursor-not-allowed text-sm'
                }`}
              >
                <span className="inline-block h-3 w-3 bg-black/40" />
                <span>
                  {isStopping
                    ? 'CUTOFF_EXECUTED // IN_GRACE'
                    : allFieldsFilled
                    ? 'EMERGENCY STOP // EXECUTE'
                    : `CUTOFF_STANDBY // FILL ALL (${filledCount}/${categories.length})`}
                </span>
                <span className="inline-block h-3 w-3 bg-black/40" />
              </button>

              <div className="w-full flex items-center justify-between px-2 mt-1.5 font-mono text-[8px] tracking-widest text-zinc-500">
                <span>SW_TYPE: SPRING_SOLENOID</span>
                <span>VOLTAGE: 24V_DC</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
