'use client';

import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Check,
  Clock,
  Flame,
  Hourglass,
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
  ShieldAlert
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import { startsWithLetter, formatAnswerDisplay } from '@/lib/gameLogic';
import { SpectatorBanner } from './SpectatorBanner';

// Category icon selector
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
  const { room, playerId, localAnswers, updateLocalAnswer, clearLocalAnswers, setNotification } =
    useGameStore();
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isSpectator = room?.players[playerId]?.isSpectator;
  const currentLetter = room?.currentLetter || 'A';
  const categories = room?.settings.categories || [];
  const roundDuration = room?.settings.roundDuration || 60;
  const timeRemaining = room?.roundTimeRemaining ?? roundDuration;
  const graceRemaining = room?.graceTimeRemaining;
  const stoppedBy = room?.stoppedBy;

  // Auto-focus the first input field when round begins
  useEffect(() => {
    if (room?.status === 'PLAYING' && !isSpectator) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 300);
    }
  }, [room?.status, isSpectator]);

  // Clean local answers when moving to next round
  useEffect(() => {
    if (room?.status === 'COUNTDOWN') {
      clearLocalAnswers();
    }
  }, [room?.status, clearLocalAnswers]);

  if (!room) return null;

  // 3-2-1 Synchronized Countdown Overlay
  if (room.status === 'COUNTDOWN') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl">
        <div className="text-center animate-scale-up">
          <span className="text-sm font-bold tracking-widest text-emerald-400 uppercase mb-4 block">
            Raund {room.currentRound} Başlayır!
          </span>
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute h-48 w-48 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
            <div className="h-36 w-36 sm:h-44 sm:w-44 rounded-3xl border-2 border-emerald-500/50 bg-slate-900/90 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <span className="text-7xl sm:text-8xl font-black text-white font-mono animate-bounce-slight">
                {room.countdownTime > 0 ? room.countdownTime : 'BAŞLA!'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Əllərinizi klaviaturada saxlayın...</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate filled categories count
  const filledCount = categories.filter((c) => (localAnswers[c.id] || '').trim().length > 0).length;
  const allFieldsFilled = filledCount === categories.length && categories.length > 0;
  const isStopping = graceRemaining !== null;

  // Timer percentage
  const timerPercentage =
    roundDuration > 0 ? Math.max(0, Math.min(100, (timeRemaining / roundDuration) * 100)) : 100;

  const handleInputChange = (catId: string, val: string) => {
    if (isSpectator || isStopping && graceRemaining === 0) return;
    updateLocalAnswer(catId, val);
  };

  const handleStopButton = () => {
    if (!allFieldsFilled) {
      setNotification({
        type: 'warning',
        message: `STOP basmaq üçün bütün ${categories.length} xananı doldurmalısınız! (${filledCount}/${categories.length})`,
      });
      return;
    }
    const socket = getSocket();
    socket.emit('game:stop', {
      roomCode: room.code,
      playerId,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Spectator Notice */}
      {isSpectator && <SpectatorBanner currentRound={room.currentRound} />}

      {/* Top Banner: Letter card, Timer, and STOP Warning */}
      <div className="glass-panel mb-8 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          {/* Target Letter Card */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-70 blur group-hover:opacity-100 transition duration-500" />
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-slate-950 border border-emerald-400/40 shadow-2xl">
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-b from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                  {currentLetter}
                </span>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold text-emerald-400 mb-1">
                <span>Hədəf Hərf</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                &quot;{currentLetter}&quot; hərfi ilə yazın!
              </h2>
              <p className="text-xs text-slate-400">
                Bütün cavablar bu hərflə başlamalıdır.
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center sm:items-end w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <Clock
                className={`h-4 w-4 ${
                  timeRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Qalan Vaxt
              </span>
            </div>

            {roundDuration > 0 ? (
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-mono text-3xl sm:text-4xl font-black tracking-tight ${
                    timeRemaining <= 5
                      ? 'text-rose-400 animate-pulse'
                      : timeRemaining <= 10
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {timeRemaining}
                </span>
                <span className="text-xs font-semibold text-slate-400">san</span>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-bold text-emerald-400">
                Limitsiz (STOP-a qədər)
              </div>
            )}

            {/* Visual Countdown Progress Bar */}
            {roundDuration > 0 && (
              <div className="w-full sm:w-48 h-2 bg-slate-900 rounded-full mt-3 overflow-hidden border border-white/5">
                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    timeRemaining <= 5
                      ? 'bg-rose-500'
                      : timeRemaining <= 10
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${timerPercentage}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Urgent STOP / Grace Period Banner */}
        {isStopping && (
          <div className="mt-6 rounded-2xl border-2 border-rose-500/60 bg-rose-950/80 p-4 text-center animate-shake relative overflow-hidden">
            <div className="flex items-center justify-center gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-400 animate-bounce" />
              <div>
                <h4 className="text-lg font-black text-white">
                  🚨 {stoppedBy?.name} &quot;STOP / BİTDİ&quot; BASDI!
                </h4>
                <p className="text-xs text-rose-200/90 font-medium mt-0.5">
                  Xanaları dərhal tamamlayın! Raund <span className="font-bold text-white text-sm underline">{graceRemaining} saniyə</span> sonra bağlanacaq!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Input Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {categories.map((cat, idx) => {
          const currentVal = localAnswers[cat.id] || '';
          const hasInput = currentVal.trim().length > 0;
          const isCorrectLetter = startsWithLetter(currentVal, currentLetter);
          const isInvalidStart = hasInput && !isCorrectLetter;

          return (
            <div
              key={cat.id}
              className={`glass-panel rounded-2xl p-4 transition-all duration-200 ${
                isInvalidStart
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : isCorrectLetter
                  ? 'border-emerald-500/50 bg-emerald-950/20 shadow-emerald-500/5'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                    {getCategoryIcon(cat.iconName)}
                  </span>
                  <span>{cat.azLabel}</span>
                  {cat.isCustom && (
                    <span className="rounded bg-purple-500/20 px-1 py-0.5 text-[9px] font-bold text-purple-300">
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
                      Doğru hərf
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">Boşdur</span>
                  )}
                </div>
              </div>

              {/* Text Input */}
              <div className="relative">
                <input
                  ref={idx === 0 ? firstInputRef : null}
                  type="text"
                  disabled={isSpectator || (isStopping && graceRemaining === 0)}
                  placeholder={`"${currentLetter}" ilə başlayan ${cat.azLabel.toLowerCase()}...`}
                  value={currentVal}
                  onChange={(e) => handleInputChange(cat.id, e.target.value)}
                  className={`w-full rounded-xl border bg-slate-950/70 px-4 py-3 text-base font-medium text-white transition placeholder-slate-600 focus:outline-none ${
                    isInvalidStart
                      ? 'border-rose-500 focus:border-rose-400'
                      : isCorrectLetter
                      ? 'border-emerald-500/70 focus:border-emerald-400'
                      : 'border-white/10 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action: STOP Smash Button */}
      {!isSpectator && (
        <div className="sticky bottom-6 z-30 flex flex-col items-center">
          <button
            onClick={handleStopButton}
            disabled={!allFieldsFilled || isStopping}
            className={`stop-btn group w-full max-w-md rounded-2xl py-4 px-8 text-center font-black tracking-wider text-white shadow-2xl transition flex items-center justify-center gap-3 ${
              !allFieldsFilled || isStopping ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Octagon className="h-7 w-7 text-white fill-white/20 group-hover:scale-110 transition-transform" />
            <span className="text-xl sm:text-2xl font-black uppercase">
              {isStopping ? 'STOP BASILDI!' : 'STOP / BİTDİ!'}
            </span>
          </button>

          <p className="mt-2.5 text-xs text-slate-400 text-center">
            {allFieldsFilled ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" /> Bütün xanalar doludur! STOP düyməsini basa bilərsiniz.
              </span>
            ) : (
              <span>
                STOP basmaq üçün bütün xanaları doldurun ({filledCount}/{categories.length})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
