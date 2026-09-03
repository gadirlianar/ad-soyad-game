'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  Flame,
  Octagon,
  Sparkles,
  User,
  Users,
  Building2,
  Globe,
  Footprints,
  Apple,
  Package,
  Briefcase,
  Film,
  Tag,
  Trophy,
  Utensils,
  Music,
  HelpCircle,
  ShieldAlert,
  ArrowDown
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { startsWithLetter } from '@/lib/gameLogic';
import { soundManager } from '@/lib/audio';
import { SpectatorBanner } from './SpectatorBanner';
import { SlotMachineReveal } from './SlotMachineReveal';
import { CircularTimer } from './CircularTimer';

function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case 'User': return <User className="h-4 w-4" />;
    case 'Users': return <Users className="h-4 w-4" />;
    case 'Building2': return <Building2 className="h-4 w-4" />;
    case 'Globe': return <Globe className="h-4 w-4" />;
    case 'Footprints': return <Footprints className="h-4 w-4" />;
    case 'Apple': return <Apple className="h-4 w-4" />;
    case 'Package': return <Package className="h-4 w-4" />;
    case 'Briefcase': return <Briefcase className="h-4 w-4" />;
    case 'Film': return <Film className="h-4 w-4" />;
    case 'Tag': return <Tag className="h-4 w-4" />;
    case 'Trophy': return <Trophy className="h-4 w-4" />;
    case 'Utensils': return <Utensils className="h-4 w-4" />;
    case 'Music': return <Music className="h-4 w-4" />;
    default: return <HelpCircle className="h-4 w-4" />;
  }
}

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
  const [shockwave, setShockwave] = useState(false);

  const isSpectator = room?.players[playerId]?.isSpectator;
  const currentLetter = room?.currentLetter || 'A';
  const categories = room?.settings.categories || [];
  const roundDuration = room?.settings.roundDuration || 60;
  const timeRemaining = room?.roundTimeRemaining ?? roundDuration;
  const graceRemaining = room?.graceTimeRemaining;
  const stoppedBy = room?.stoppedBy;

  // Auto-focus first input field when round begins
  useEffect(() => {
    if (room?.status === 'PLAYING' && !isSpectator) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [room?.status, isSpectator]);

  // Clean local answers on countdown
  useEffect(() => {
    if (room?.status === 'COUNTDOWN') {
      clearLocalAnswers();
    }
  }, [room?.status, clearLocalAnswers]);

  // Shockwave trigger when STOP is initiated
  useEffect(() => {
    if (graceRemaining !== null) {
      setShockwave(true);
      const t = setTimeout(() => setShockwave(false), 1200);
      return () => clearTimeout(t);
    }
  }, [graceRemaining]);

  if (!room) return null;

  // 3D Slot Machine Letter Reveal on COUNTDOWN
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
    updateLocalAnswer(catId, val);
  };

  // Auto-advance to next input field on Enter
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
        message: `STOP üçün bütün ${categories.length} xanaları doldurun! (${filledCount}/${categories.length})`,
      });
      return;
    }
    sendGameAction('stop');
  };

  const otherPlayers = Object.values(room.players).filter((p) => p.id !== playerId && !p.isSpectator);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 relative">
      {/* Shockwave visual pulse when STOP is smashed */}
      {shockwave && (
        <motion.div
          initial={{ opacity: 0.8, scale: 0.8 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-0 z-40 bg-rose-600/30 filter blur-3xl"
        />
      )}

      {isSpectator && <SpectatorBanner currentRound={room.currentRound} />}

      {/* Top Arena Dashboard Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/[0.08] bg-[#08080a]/90 p-6 sm:p-8 backdrop-blur-xl mb-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          {/* Target Letter Card */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60 blur group-hover:opacity-100 transition duration-500" />
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-[#08080a] border border-emerald-400/40 shadow-2xl">
                <span className="font-mono text-5xl sm:text-6xl font-black bg-gradient-to-b from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  {currentLetter}
                </span>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-400 mb-1">
                <span>Hədəf Hərf</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                &quot;{currentLetter}&quot; ilə sözləri yazın
              </h2>
              <p className="text-xs text-slate-400">
                Enter və ya Tab ilə növbəti xanaya sürətlə keçin
              </p>
            </div>
          </div>

          {/* Right: Circular Timer & Peer presence */}
          <div className="flex items-center gap-6">
            {/* Live Peer Presence Indicators */}
            {otherPlayers.length > 0 && (
              <div className="hidden md:flex items-center gap-2 border-r border-white/10 pr-6">
                {otherPlayers.map((p) => {
                  const pAnswers = room.answers[p.id] || {};
                  const pFilled = Object.values(pAnswers).filter((v) => (v || '').trim().length > 0).length;
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
                      title={`${p.name}: ${pFilled}/${categories.length} doldurub`}
                    >
                      <span className="text-lg">{p.avatar}</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            pFilled === categories.length
                              ? 'bg-rose-500 animate-ping'
                              : pFilled > 0
                              ? 'bg-emerald-400'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span className="font-mono text-[9px] font-bold text-slate-400">
                          {pFilled}/{categories.length}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Circular Timer Ring */}
            <CircularTimer timeRemaining={timeRemaining} totalDuration={roundDuration} />
          </div>
        </div>

        {/* STOP Grace Period Banner */}
        <AnimatePresence>
          {isStopping && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 rounded-2xl border-2 border-rose-500/80 bg-rose-950/80 p-4 text-center overflow-hidden"
            >
              <div className="flex items-center justify-center gap-3">
                <ShieldAlert className="h-6 w-6 text-rose-400 animate-bounce" />
                <div>
                  <h4 className="text-lg font-black text-white">
                    🚨 {stoppedBy?.name} &quot;STOP / BİTDİ&quot; BASDI!
                  </h4>
                  <p className="text-xs text-rose-200 font-semibold">
                    Son xanaları tamamlayın! Raund{' '}
                    <span className="text-white font-bold underline text-sm">{graceRemaining} saniyə</span>{' '}
                    sonra bağlanır!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Responsive Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {categories.map((cat, idx) => {
          const currentVal = localAnswers[cat.id] || '';
          const hasInput = currentVal.trim().length > 0;
          const isCorrectLetter = startsWithLetter(currentVal, currentLetter);
          const isInvalidStart = hasInput && !isCorrectLetter;

          return (
            <div
              key={cat.id}
              className={`rounded-2xl border p-4 backdrop-blur-xl transition-all duration-200 ${
                isInvalidStart
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : isCorrectLetter
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : 'border-white/[0.08] bg-[#0e0e12]/70 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.04] text-slate-300">
                    {getCategoryIcon(cat.iconName)}
                  </span>
                  <span>{cat.azLabel}</span>
                  {cat.isCustom && (
                    <span className="rounded bg-violet-500/20 px-1 py-0.5 text-[9px] font-bold text-violet-300">
                      Xüsusi
                    </span>
                  )}
                </label>

                {/* Status indicator badge */}
                <div>
                  {isInvalidStart ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      &quot;{currentLetter}&quot; ilə başlamalıdır!
                    </span>
                  ) : isCorrectLetter ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      Doğru
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-600">Boşdur</span>
                  )}
                </div>
              </div>

              {/* Text Input with Enter auto-advance */}
              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                disabled={isSpectator || (isStopping && graceRemaining === 0)}
                placeholder={`"${currentLetter}" ilə başlayan ${cat.azLabel.toLowerCase()}...`}
                value={currentVal}
                onFocus={() => soundManager.playFocusClick()}
                onChange={(e) => handleInputChange(cat.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`w-full rounded-xl border bg-[#08080a] px-4 py-3 text-base font-medium text-white placeholder-slate-700 focus:outline-none transition ${
                  isInvalidStart
                    ? 'border-rose-500 focus:border-rose-400'
                    : isCorrectLetter
                    ? 'border-emerald-500/70 focus:border-emerald-400'
                    : 'border-white/10 focus:border-emerald-500'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* High-Voltage Sticky STOP Button */}
      {!isSpectator && (
        <div className="sticky bottom-6 z-30 flex flex-col items-center">
          <motion.button
            whileTap={{ scale: allFieldsFilled && !isStopping ? 0.95 : 1 }}
            onClick={handleStopButton}
            disabled={!allFieldsFilled || isStopping}
            className={`w-full max-w-md rounded-2xl py-4 px-8 text-center font-black tracking-wider text-white shadow-2xl transition flex items-center justify-center gap-3 ${
              allFieldsFilled && !isStopping
                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 shadow-rose-600/40 hover:brightness-110 cursor-pointer animate-pulse ring-4 ring-rose-500/30'
                : 'bg-white/[0.05] text-slate-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            <Octagon className="h-6 w-6 fill-white/20" />
            <span className="text-xl sm:text-2xl font-black uppercase">
              {isStopping ? 'STOP BASILDI!' : 'STOP / BİTDİ!'}
            </span>
          </motion.button>

          <p className="mt-2 text-xs text-slate-400 text-center">
            {allFieldsFilled ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" /> Bütün xanalar doludur! STOP düyməsini basın.
              </span>
            ) : (
              <span>STOP basmaq üçün bütün xanaları doldurun ({filledCount}/{categories.length})</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
