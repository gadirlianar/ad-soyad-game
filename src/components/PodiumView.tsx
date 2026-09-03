'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Crown, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { tactileAudio } from '@/lib/audio';

export const PodiumView: React.FC = () => {
  const { room, playerId, sendGameAction } = useGameStore();

  const isFinished = room?.status === 'FINISHED';
  const isHost = room?.hostId === playerId || room?.players[playerId]?.isHost;

  useEffect(() => {
    if (isFinished) {
      tactileAudio.playVictoryFanfare();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#007AFF', '#34C759', '#FF9500'],
      });
    }
  }, [isFinished]);

  if (!room) return null;

  const sortedPlayers = Object.values(room.players)
    .filter((p) => !p.isSpectator)
    .sort((a, b) => b.score - a.score);

  const top1 = sortedPlayers[0];

  const handlePlayAgain = () => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    sendGameAction('play_again');
  };

  const handleNextRound = () => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    sendGameAction('next_round');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 select-none">
      <div className="apple-glass rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-[#007AFF] uppercase tracking-wider block mb-1">
            {isFinished ? 'Nəticə' : `Raund ${room.currentRound} / ${room.settings.totalRounds}`}
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {isFinished ? 'Təbriklər, Qalib Bəlli Oldu! 🏆' : 'Xal Cədvəli'}
          </h1>
        </div>

        {/* Top 1 Champion Card if Finished */}
        {isFinished && top1 && (
          <div className="mb-6 p-6 rounded-2xl bg-neutral-100 dark:bg-white/[0.04] flex flex-col items-center text-center">
            <span className="text-5xl mb-2">{top1.avatar}</span>
            <div className="flex items-center gap-1.5 mb-1">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                {top1.name}
              </span>
            </div>
            <span className="text-2xl font-black text-[#007AFF] tabular-nums">
              {top1.score} xal
            </span>
          </div>
        )}

        {/* Leaderboard Table List */}
        <div className="rounded-2xl border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden mb-6">
          {sortedPlayers.map((player, idx) => {
            const isMe = player.id === playerId;
            const roundDelta = player.roundScores[room.currentRound] || 0;

            return (
              <div
                key={player.id}
                className="p-4 flex items-center justify-between bg-white/40 dark:bg-transparent"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-xs font-semibold text-neutral-400 w-4">
                    {idx + 1}
                  </span>
                  <span className="text-2xl">{player.avatar}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {player.name} {isMe && <span className="text-neutral-400 text-xs font-normal">· Sən</span>}
                    </span>
                    {!isFinished && (
                      <span className="text-xs text-neutral-400">
                        Bu raund: +{roundDelta} xal
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-base font-bold text-neutral-900 dark:text-white tabular-nums">
                  {player.score} xal
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          {isHost ? (
            isFinished ? (
              <button
                onClick={handlePlayAgain}
                className="rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold px-8 py-3.5 shadow-[0_4px_16px_rgba(0,122,255,0.3)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Yenidən Oyna</span>
              </button>
            ) : (
              <button
                onClick={handleNextRound}
                className="rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold px-8 py-3.5 shadow-[0_4px_16px_rgba(0,122,255,0.3)] transition-all cursor-pointer"
              >
                Növbəti Raundu Başlat
              </button>
            )
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              Host növbəti mərhələni başlatdıqda davam edəcək...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
