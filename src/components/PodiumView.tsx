'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Crown,
  RotateCcw,
  Zap,
  BookOpen,
  Copy,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useGameStore } from '@/lib/store';

export const PodiumView: React.FC = () => {
  const { room, playerId, sendGameAction } = useGameStore();

  const isFinished = room?.status === 'FINISHED';
  const isHost = room?.players[playerId]?.isHost;

  useEffect(() => {
    if (isFinished) {
      const end = Date.now() + 3.5 * 1000;
      const colors = ['#10B981', '#7C3AED', '#06B6D4', '#F59E0B'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isFinished]);

  if (!room) return null;

  const sortedPlayers = Object.values(room.players)
    .filter((p) => !p.isSpectator)
    .sort((a, b) => b.score - a.score);

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  const handlePlayAgain = () => {
    if (!isHost) return;
    sendGameAction('play_again');
  };

  const handleNextRound = () => {
    if (!isHost) return;
    sendGameAction('next_round');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {isFinished ? (
        <div className="space-y-8">
          {/* Olympic 3D Podium Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-white/[0.08] bg-[#08080a]/90 p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl backdrop-blur-2xl"
          >
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />

            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300 mb-3">
              <Trophy className="h-4 w-4" />
              <span>OYUNUN QALİBİ MÜƏYYƏN OLDU!</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Möhtəşəm Qələbə! 🏆
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {room.settings.totalRounds} raundluq gərgin mübarizənin nəticələri
            </p>

            {/* 3D Olympic Podium */}
            <div className="mt-12 flex items-end justify-center gap-3 sm:gap-6 max-w-lg mx-auto">
              {/* 2nd Place */}
              {top2 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center flex-1"
                >
                  <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{top2.avatar}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px]">
                    {top2.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 mb-2">{top2.score} xal</span>
                  <div className="w-full h-24 sm:h-28 rounded-t-2xl border-t-2 border-l-2 border-r-2 border-slate-400/40 bg-gradient-to-b from-slate-700/70 to-slate-900/90 flex flex-col items-center justify-center shadow-lg shadow-black/60">
                    <span className="text-2xl font-black text-slate-300">2</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gümüş</span>
                  </div>
                </motion.div>
              )}

              {/* 1st Place Champion */}
              {top1 && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center flex-1 -mt-8"
                >
                  <Crown className="h-7 w-7 text-amber-400 animate-bounce mb-1 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  <span className="text-5xl sm:text-6xl mb-1 filter drop-shadow-xl">{top1.avatar}</span>
                  <span className="text-sm sm:text-base font-black text-white truncate max-w-[110px]">
                    {top1.name}
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-400 mb-2">
                    {top1.score} xal
                  </span>
                  <div className="w-full h-36 sm:h-40 rounded-t-2xl border-t-2 border-l-2 border-r-2 border-amber-400/60 bg-gradient-to-b from-amber-500/80 via-amber-700/80 to-[#0e0e14] flex flex-col items-center justify-center shadow-2xl shadow-amber-500/30">
                    <span className="text-3xl font-black text-amber-100">1</span>
                    <span className="text-[11px] font-bold text-amber-200 uppercase">Çempion</span>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {top3 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 350, damping: 25 }}
                  className="flex flex-col items-center flex-1"
                >
                  <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{top3.avatar}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px]">
                    {top3.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 mb-2">{top3.score} xal</span>
                  <div className="w-full h-18 sm:h-20 rounded-t-2xl border-t-2 border-l-2 border-r-2 border-amber-700/40 bg-gradient-to-b from-amber-800/60 to-slate-950 flex flex-col items-center justify-center shadow-md">
                    <span className="text-xl font-black text-amber-500">3</span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Bürünc</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Play Again Action */}
            <div className="mt-10">
              {isHost ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handlePlayAgain}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/30 transition inline-flex items-center gap-2.5"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Yenidən Oyna</span>
                </motion.button>
              ) : (
                <p className="text-xs text-slate-400">Host &quot;Yenidən Oyna&quot; seçdikdə otaq sıfırlanacaq.</p>
              )}
            </div>
          </motion.div>

          {/* Awards Bento Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e12]/70 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Zap className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Ən Sürətli Yazıçı</span>
              </div>
              <p className="text-sm font-bold text-white">{top1?.name || '-'}</p>
              <span className="text-[11px] text-slate-400">STOP düyməsini ən tez aktivləşdirən</span>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e12]/70 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-violet-400 mb-2">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Lüğət Dahisi</span>
              </div>
              <p className="text-sm font-bold text-white">{top1?.name || '-'}</p>
              <span className="text-[11px] text-slate-400">Ən çox unikal 10 xallıq söz yazan</span>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e12]/70 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Copy className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Telepat</span>
              </div>
              <p className="text-sm font-bold text-white">{top2?.name || top1?.name || '-'}</p>
              <span className="text-[11px] text-slate-400">Rəqiblərlə ən çox eyni sözü tapan</span>
            </div>
          </div>
        </div>
      ) : (
        /* Round Breakdown Scoreboard */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/[0.08] bg-[#08080a]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400 mb-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Raund {room.currentRound} / {room.settings.totalRounds} Tamamlandı</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Xal Cədvəli və Sıralama</h2>
            </div>

            {isHost ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleNextRound}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 text-xs sm:text-sm"
              >
                Növbəti Raundu Başlat
              </motion.button>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs text-slate-400">
                Host növbəti raundu başladır...
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            {sortedPlayers.map((player, idx) => {
              const isMe = player.id === playerId;
              const roundPoints = player.roundScores[room.currentRound] || 0;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                    isMe
                      ? 'border-emerald-500/40 bg-emerald-950/20 shadow-md'
                      : 'border-white/[0.06] bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <span className="font-bold text-white text-sm sm:text-base">{player.name}</span>
                        <div className="text-xs text-slate-400">
                          Bu raund: <span className="font-bold text-emerald-400">+{roundPoints} xal</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Ümumi</span>
                    <span className="font-mono text-2xl font-black text-white tabular-nums">
                      {player.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
