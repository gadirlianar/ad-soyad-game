'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  Play,
  RotateCcw,
  Crown,
  Sparkles,
  ArrowUp,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';

export const Scoreboard: React.FC = () => {
  const { room, playerId } = useGameStore();

  const isFinished = room?.status === 'FINISHED';
  const isHost = room?.players[playerId]?.isHost;

  // Trigger confetti shower when game finishes
  useEffect(() => {
    if (isFinished) {
      const end = Date.now() + 3.5 * 1000;
      const colors = ['#22c55e', '#06b6d4', '#a855f7', '#f59e0b'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 4,
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

  // Sort players by cumulative score descending
  const sortedPlayers = Object.values(room.players)
    .filter((p) => !p.isSpectator)
    .sort((a, b) => b.score - a.score);

  const top1 = sortedPlayers[0];
  const top2 = sortedPlayers[1];
  const top3 = sortedPlayers[2];

  const handleNextRound = () => {
    if (!isHost) return;
    const socket = getSocket();
    socket.emit('game:next_round', { roomCode: room.code });
  };

  const handlePlayAgain = () => {
    if (!isHost) return;
    const socket = getSocket();
    socket.emit('game:play_again', { roomCode: room.code });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Grand Victory Podium (When FINISHED) */}
      {isFinished ? (
        <div className="glass-panel mb-8 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 text-xs font-bold text-amber-300 mb-3">
            <Trophy className="h-4 w-4" />
            <span>OYUNUN QALİBİ BƏLLİ OLDU!</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Təbriklər! 🏆
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {room.settings.totalRounds} raundluq gərgin mübarizə yekunlaşdı!
          </p>

          {/* 3D Olympic Podium Display */}
          <div className="mt-10 flex items-end justify-center gap-3 sm:gap-6 max-w-lg mx-auto">
            {/* 2nd Place */}
            {top2 && (
              <div className="flex flex-col items-center flex-1 animate-scale-up">
                <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{top2.avatar}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px]">
                  {top2.name}
                </span>
                <span className="text-xs font-black text-slate-400 mb-2">{top2.score} xal</span>
                <div className="w-full h-24 sm:h-28 rounded-t-2xl border-t-2 border-l-2 border-r-2 border-slate-400/40 bg-gradient-to-b from-slate-700/80 to-slate-900/90 flex flex-col items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-slate-300">2</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gümüş</span>
                </div>
              </div>
            )}

            {/* 1st Place (Champion) */}
            {top1 && (
              <div className="flex flex-col items-center flex-1 -mt-6 animate-scale-up">
                <Crown className="h-6 w-6 text-amber-400 animate-bounce mb-1" />
                <span className="text-4xl sm:text-5xl mb-1 filter drop-shadow-xl">{top1.avatar}</span>
                <span className="text-sm sm:text-base font-black text-white truncate max-w-[110px]">
                  {top1.name}
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-400 mb-2">
                  {top1.score} xal
                </span>
                <div className="w-full h-32 sm:h-36 rounded-t-2xl border-t-2 border-l-2 border-r-2 border-amber-400/60 bg-gradient-to-b from-amber-500/80 to-amber-900/90 flex flex-col items-center justify-center shadow-2xl shadow-amber-500/30">
                  <span className="text-3xl font-black text-amber-100">1</span>
                  <span className="text-[11px] font-bold text-amber-200 uppercase">Çempion</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div className="flex flex-col items-center flex-1 animate-scale-up">
                <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow">{top3.avatar}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px]">
                  {top3.name}
                </span>
                <span className="text-xs font-black text-amber-600 mb-2">{top3.score} xal</span>
                <div className="w-full h-18 sm:h-20 rounded-t-2xl border-t-2 border-l-2 border-r-2 border-amber-700/40 bg-gradient-to-b from-amber-800/60 to-slate-900/90 flex flex-col items-center justify-center shadow-md">
                  <span className="text-xl font-black text-amber-500">3</span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Bürünc</span>
                </div>
              </div>
            )}
          </div>

          {/* Action: Play Again */}
          <div className="mt-10">
            {isHost ? (
              <button
                onClick={handlePlayAgain}
                className="tactile-btn rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-8 py-4 text-base font-black text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:scale-105 inline-flex items-center gap-2.5"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Yenidən Oyna</span>
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                Host &quot;Yenidən Oyna&quot; seçdikdə otaq sıfırlanacaq.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Round Complete Scoreboard */
        <div className="glass-panel mb-8 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400 mb-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Raund {room.currentRound} / {room.settings.totalRounds} Yekunlaşdı</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Xal Cədvəli və Reytinq</h2>
            </div>

            {/* Next Round Action (Host) */}
            {isHost ? (
              <button
                onClick={handleNextRound}
                className="tactile-btn rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 flex items-center gap-2 text-sm"
              >
                <span>Növbəti Raundu Başlat</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-slate-400">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Host növbəti raundu başladır...</span>
              </div>
            )}
          </div>

          {/* Leaderboard Table */}
          <div className="space-y-3">
            {sortedPlayers.map((player, idx) => {
              const isMe = player.id === playerId;
              const roundPoints = player.roundScores[room.currentRound] || 0;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                    isMe
                      ? 'border-emerald-500/40 bg-emerald-950/25 shadow-sm'
                      : 'border-white/5 bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Position Number */}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-500 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm sm:text-base">
                            {player.name}
                          </span>
                          {isMe && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                              Sən
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          Bu raund: <span className="font-bold text-emerald-400">+{roundPoints} xal</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Cumulative Score */}
                  <div className="text-right">
                    <span className="text-xs uppercase font-bold text-slate-500 block">Ümumi Xal</span>
                    <span className="font-mono text-2xl font-black text-white">{player.score}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
