'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { tactileAudio } from '@/lib/audio';

export const PodiumView: React.FC = () => {
  const { room, playerId, sendGameAction } = useGameStore();

  const isFinished = room?.status === 'FINISHED';
  const isHost = room?.hostId === playerId || room?.players[playerId]?.isHost;

  useEffect(() => {
    if (isFinished) {
      tactileAudio.playVictoryFanfare();
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#D4FF00', '#FF4800', '#FFFFFF', '#161922'];

      (function frame() {
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 45,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 45,
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
    tactileAudio.playStopBuzzer();
    sendGameAction('play_again');
  };

  const handleNextRound = () => {
    if (!isHost) return;
    tactileAudio.playStopBuzzer();
    sendGameAction('next_round');
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 font-mono">
      {isFinished ? (
        <div className="space-y-6">
          {/* Olympic Machined Telemetry Pedestal Box */}
          <div className="border border-white/[0.1] bg-[#0E1015] p-6 sm:p-10 text-center relative crosshair-corner">
            <div className="flex items-center justify-center gap-2 text-[10px] tracking-tracked text-[#D4FF00] mb-2 uppercase">
              <span className="inline-block h-2 w-2 bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]" />
              <span>TOURNAMENT_SETTLEMENT // SESSION_FINALIZED</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tighter text-white uppercase">
              FINAL TRANSMİSSİYA LİDERİ 🏆
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              {room.settings.totalRounds} RAUNDLUQ OPERASİYANIN YEKUN REYTİNQ CƏDVƏLİ
            </p>

            {/* Industrial Pedestals */}
            <div className="mt-10 flex items-end justify-center gap-2 sm:gap-4 max-w-lg mx-auto">
              {/* 2nd Place */}
              {top2 && (
                <div className="flex flex-col items-center flex-1">
                  <span className="text-3xl mb-1">{top2.avatar}</span>
                  <span className="text-xs font-bold text-zinc-300 truncate max-w-[90px]">
                    {top2.name}
                  </span>
                  <span className="text-xs text-zinc-400 mb-2">{top2.score} PTS</span>
                  <div className="w-full h-24 sm:h-28 border border-white/[0.12] bg-[#12141A] flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-zinc-400">02</span>
                    <span className="text-[9px] text-zinc-500 uppercase">GÜMÜŞ</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top1 && (
                <div className="flex flex-col items-center flex-1 -mt-6">
                  <span className="text-5xl mb-1">{top1.avatar}</span>
                  <span className="text-sm font-black text-white truncate max-w-[110px]">
                    {top1.name}
                  </span>
                  <span className="text-sm font-black text-[#D4FF00] mb-2">
                    {top1.score} PTS
                  </span>
                  <div className="w-full h-36 sm:h-40 border-2 border-[#D4FF00] bg-[#161922] flex flex-col items-center justify-center shadow-[0_0_20px_rgba(212,255,0,0.2)]">
                    <span className="text-3xl font-black text-[#D4FF00]">01</span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tracked">ÇEMPİON</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3 && (
                <div className="flex flex-col items-center flex-1">
                  <span className="text-3xl mb-1">{top3.avatar}</span>
                  <span className="text-xs font-bold text-zinc-300 truncate max-w-[90px]">
                    {top3.name}
                  </span>
                  <span className="text-xs text-zinc-400 mb-2">{top3.score} PTS</span>
                  <div className="w-full h-20 sm:h-22 border border-white/[0.12] bg-[#12141A] flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-zinc-500">03</span>
                    <span className="text-[9px] text-zinc-500 uppercase">BÜRÜNC</span>
                  </div>
                </div>
              )}
            </div>

            {/* Play Again Trigger */}
            <div className="mt-8">
              {isHost ? (
                <button
                  onClick={handlePlayAgain}
                  className="bg-[#D4FF00] hover:bg-[#DCFF33] text-black font-mono font-bold text-xs uppercase px-8 py-3.5 tracking-tracked shadow-hard-lime hardware-key cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>YENİ SESSİYA BAŞLAT // RE-INITIALIZE</span>
                </button>
              ) : (
                <div className="text-[10px] text-zinc-500 tracking-tracked">
                  [AWAITING HOST TO TRIGGER NEW REEL SESSION...]
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Awards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-white/[0.08] bg-[#0E1015] p-4 crosshair-corner">
              <div className="text-[9px] text-[#FF4800] tracking-tracked mb-1">
                AWARD_01 // SPEED_CUTOFF
              </div>
              <p className="text-sm font-bold text-white">{top1?.name || '-'}</p>
              <span className="text-[10px] text-zinc-500">STOP düyməsini ən tez aktivləşdirən</span>
            </div>

            <div className="border border-white/[0.08] bg-[#0E1015] p-4 crosshair-corner">
              <div className="text-[9px] text-[#D4FF00] tracking-tracked mb-1">
                AWARD_02 // LEXICON_MASTER
              </div>
              <p className="text-sm font-bold text-white">{top1?.name || '-'}</p>
              <span className="text-[10px] text-zinc-500">Ən yüksək unikal söz tapıntısı</span>
            </div>

            <div className="border border-white/[0.08] bg-[#0E1015] p-4 crosshair-corner">
              <div className="text-[9px] text-zinc-400 tracking-tracked mb-1">
                AWARD_03 // P2P_TELEPATH
              </div>
              <p className="text-sm font-bold text-white">{top2?.name || top1?.name || '-'}</p>
              <span className="text-[10px] text-zinc-500">Rəqiblərlə ən çox eyni sözü tapan</span>
            </div>
          </div>
        </div>
      ) : (
        /* Round Breakdown Scoreboard */
        <div className="border border-white/[0.1] bg-[#0E1015] p-5 sm:p-8 crosshair-corner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[10px] tracking-tracked text-[#D4FF00] mb-1 uppercase">
                <Sparkles className="h-3 w-3" />
                <span>RAUND 0{room.currentRound} / 0{room.settings.totalRounds} TAMAMLANDI</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase">
                XAL MATRİSİ VƏ SESSİYA REYTİNQİ
              </h2>
            </div>

            {isHost ? (
              <button
                onClick={handleNextRound}
                className="bg-[#D4FF00] hover:bg-[#DCFF33] text-black font-mono font-bold text-xs uppercase px-5 py-3 tracking-tracked shadow-hard-lime hardware-key cursor-pointer"
              >
                NÖVBƏTİ RAUNDU BAŞLAT // ADVANCE
              </button>
            ) : (
              <div className="border border-white/[0.08] bg-[#12141A] px-3 py-2 text-[10px] text-zinc-400">
                [HOST NÖVBƏTİ RAUNDU BAŞLADIR...]
              </div>
            )}
          </div>

          {/* Leaderboard Table Rows */}
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => {
              const isMe = player.id === playerId;
              const roundPoints = player.roundScores[room.currentRound] || 0;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between border p-3 bg-[#12141A] transition ${
                    idx === 0
                      ? 'border-[#D4FF00]/40'
                      : isMe
                      ? 'border-white/[0.2]'
                      : 'border-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-zinc-500 w-6">
                      0{idx + 1}
                    </span>
                    <span className="text-xl">{player.avatar}</span>
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-white text-xs">
                        {player.name} {isMe && <span className="text-zinc-500 text-[9px]">[YOU]</span>}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        RAUND_DELTA: +{roundPoints} PTS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm sm:text-base font-black text-white tabular-nums">
                      {player.score} <span className="text-[10px] text-zinc-500 font-normal">PTS</span>
                    </span>
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
