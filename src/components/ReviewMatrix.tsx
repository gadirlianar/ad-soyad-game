'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Gavel,
  Columns,
  LayoutGrid
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { calculateRoundScores } from '@/lib/gameLogic';
import { tactileAudio } from '@/lib/audio';
import { CategoryScore } from '@/types/game';

export const ReviewMatrix: React.FC = () => {
  const { room, playerId, sendGameAction } = useGameStore();
  const [viewMode, setViewMode] = useState<'carousel' | 'matrix'>('carousel');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  if (!room) return null;

  const currentPlayer = room.players[playerId];
  const isHost = room.hostId === playerId || currentPlayer?.isHost;
  const categories = room.settings.categories;
  const activePlayers = Object.values(room.players).filter((p) => !p.isSpectator);

  const previewRoundResult = calculateRoundScores(room);
  const activeCategory = categories[currentCategoryIndex] || categories[0];

  const handleVote = (targetPlayerId: string, categoryId: string, approved: boolean) => {
    if (playerId === targetPlayerId) return;
    tactileAudio.playVoteClick(approved);
    sendGameAction('vote', {
      voterId: playerId,
      targetPlayerId,
      categoryId,
      approved,
    });
  };

  const handleHostOverride = (targetPlayerId: string, categoryId: string, currentValid: boolean) => {
    if (!isHost) return;
    tactileAudio.playVoteClick(!currentValid);
    sendGameAction('override', {
      targetPlayerId,
      categoryId,
      isValid: !currentValid,
    });
  };

  const handleFinalizeReview = () => {
    if (!isHost) return;
    tactileAudio.playRoundComplete();
    sendGameAction('finalize');
  };

  const renderReasonBadge = (score: CategoryScore) => {
    if (!score.isValid) {
      if (score.reason === 'empty') {
        return (
          <span className="font-mono text-[10px] tracking-widest text-zinc-600 bg-black/60 px-2 py-0.5 border border-white/[0.04]">
            [NULL_RECORD // 00 PTS]
          </span>
        );
      }
      if (score.reason === 'wrong_letter') {
        return (
          <span className="font-mono text-[10px] tracking-widest text-[#FF4800] bg-[#FF4800]/10 px-2 py-0.5 border border-[#FF4800]/30 font-bold">
            [CHAR_MISMATCH // 00 PTS]
          </span>
        );
      }
      if (score.reason === 'disapproved') {
        return (
          <span className="font-mono text-[10px] tracking-widest text-[#FF4800] bg-[#FF4800]/15 px-2 py-0.5 border border-[#FF4800]/40 font-bold">
            [VOTE_REVOKED // 00 PTS]
          </span>
        );
      }
      if (score.reason === 'host_override') {
        return (
          <span className="font-mono text-[10px] tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/30">
            [HOST_OVERRIDE // 00 PTS]
          </span>
        );
      }
    }

    if (score.reason === 'solo') {
      return (
        <span className="font-mono text-[10px] tracking-widest text-black bg-[#D4FF00] px-2 py-0.5 font-bold shadow-[0_0_8px_rgba(212,255,0,0.4)]">
          ★ [MONOPOLY_SOLE // +15 PTS]
        </span>
      );
    }
    if (score.reason === 'duplicate') {
      return (
        <span className="font-mono text-[10px] tracking-widest text-amber-300 bg-amber-950/40 px-2 py-0.5 border border-amber-500/40">
          ∥ [DUPLICATE_CONFLICT // +05 PTS]
        </span>
      );
    }
    return (
      <span className="font-mono text-[10px] tracking-widest text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 border border-[#D4FF00]/30 font-semibold">
        ✓ [VALID_SIGNAL // +10 PTS]
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      {/* Top Ledger Header Strip */}
      <div className="border border-white/[0.1] bg-[#0E1015] p-4 sm:p-6 mb-6 crosshair-corner">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-tracked text-zinc-500 mb-1">
              <span className="inline-block h-1.5 w-1.5 bg-[#D4FF00]" />
              <span>AUDIT_LEDGER // PEER_CONSENSUS_MATRIX // ROUND 0{room.currentRound}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white uppercase">
              KONSENSUS VƏ AUDİT SİYAHISI
            </h1>
            <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
              HƏRF: <span className="text-[#D4FF00] font-bold">&quot;{room.currentLetter}&quot;</span> // UNİKAL: 10 XAL, TƏK: 15 XAL, TƏKRAR: 5 XAL
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* View Mode Toggle */}
            <div className="flex border border-white/[0.1] bg-[#12141A] p-0.5 font-mono text-xs">
              <button
                onClick={() => setViewMode('carousel')}
                className={`px-3 py-1 flex items-center gap-1.5 text-[11px] transition ${
                  viewMode === 'carousel' ? 'bg-[#232732] text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Karusel Görünüşü"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>CHNL_VIEW</span>
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1 flex items-center gap-1.5 text-[11px] transition ${
                  viewMode === 'matrix' ? 'bg-[#232732] text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Matris Görünüşü"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>ALL_MATRIX</span>
              </button>
            </div>

            {/* Host Finalize Action Button */}
            {isHost ? (
              <button
                onClick={handleFinalizeReview}
                className="bg-[#D4FF00] hover:bg-[#DCFF33] text-black font-mono font-bold text-xs uppercase px-5 py-3 tracking-tracked shadow-hard-lime hardware-key cursor-pointer"
              >
                COMMIT LEDGER // NÖVBƏTİ MƏRHƏLƏ
              </button>
            ) : (
              <div className="border border-white/[0.08] bg-[#12141A] px-3 py-2 font-mono text-[10px] text-zinc-400">
                [AWAITING HOST_COMMIT_KEY...]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Selector (If Carousel Mode) */}
      {viewMode === 'carousel' && (
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-6 font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-tracked text-zinc-500">
              AUDIT_CHANNEL 0{currentCategoryIndex + 1} / 0{categories.length}
            </span>
            <span className="text-lg font-bold text-white uppercase">
              {activeCategory?.azLabel}
            </span>
            <span className="text-[10px] font-bold bg-[#D4FF00]/15 text-[#D4FF00] px-2 py-0.5 border border-[#D4FF00]/30">
              TARGET: &quot;{room.currentLetter}&quot;
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentCategoryIndex === 0}
              onClick={() => setCurrentCategoryIndex((prev) => Math.max(0, prev - 1))}
              className="border border-white/[0.1] bg-[#12141A] p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={currentCategoryIndex === categories.length - 1}
              onClick={() => setCurrentCategoryIndex((prev) => Math.min(categories.length - 1, prev + 1))}
              className="border border-white/[0.1] bg-[#12141A] p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Split-Diff Audit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(viewMode === 'carousel' ? [activeCategory] : categories).map((cat) => {
          return activePlayers.map((player) => {
            const isMe = player.id === playerId;
            const scoreInfo = previewRoundResult.scores[player.id]?.[cat.id] || {
              value: '',
              isValid: false,
              reason: 'empty',
              points: 0,
              upvotes: 0,
              downvotes: 0,
            };
            const voteKey = `${player.id}_${cat.id}`;
            const playerVotes = room.votes[voteKey] || {};
            const myVote = playerVotes[playerId];

            return (
              <div
                key={`${cat.id}_${player.id}`}
                className={`relative flex flex-col justify-between border bg-[#0E1015] p-4 transition ${
                  !scoreInfo.isValid
                    ? 'border-[#FF4800]/40'
                    : scoreInfo.points >= 15
                    ? 'border-[#D4FF00]/80 shadow-[0_0_15px_rgba(212,255,0,0.1)]'
                    : scoreInfo.points === 10
                    ? 'border-white/[0.15]'
                    : 'border-amber-500/40'
                }`}
              >
                {/* Header Strip of Audit Card */}
                <div>
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-base">{player.avatar}</span>
                      <span className="font-bold text-white tracking-tight">
                        {player.name} {isMe && <span className="text-zinc-500 text-[9px]">[YOU]</span>}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] text-zinc-400">
                      {cat.azLabel.toUpperCase()}
                    </div>
                  </div>

                  {/* The Word / Value Display */}
                  <div className="py-2">
                    <div className="text-[9px] font-mono tracking-widest text-zinc-500 mb-0.5">
                      SUBMISSION_PAYLOAD
                    </div>
                    <div
                      className={`font-mono text-xl sm:text-2xl font-black tracking-tight ${
                        scoreInfo.value.trim() ? 'text-white' : 'text-zinc-700 italic'
                      }`}
                    >
                      {scoreInfo.value.trim() ? scoreInfo.value : '— [BOŞDUR] —'}
                    </div>
                  </div>

                  {/* Audit Ledger Status Badge */}
                  <div className="mt-2 flex items-center justify-between">
                    {renderReasonBadge(scoreInfo)}
                    <span className="font-mono text-xs font-bold text-white tabular-nums">
                      +{scoreInfo.points} PTS
                    </span>
                  </div>
                </div>

                {/* Consensus Peer Voting Controls & Host Override */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  {/* Peer Binary Toggle Switches */}
                  {!isMe ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(player.id, cat.id, true)}
                        className={`font-mono text-[10px] tracking-widest px-2.5 py-1 border transition hardware-key cursor-pointer ${
                          myVote === true
                            ? 'bg-[#D4FF00] text-black border-[#D4FF00] font-bold'
                            : 'bg-[#161922] text-zinc-400 border-white/[0.1] hover:text-white'
                        }`}
                      >
                        [VALID] ({scoreInfo.upvotes})
                      </button>
                      <button
                        onClick={() => handleVote(player.id, cat.id, false)}
                        className={`font-mono text-[10px] tracking-widest px-2.5 py-1 border transition hardware-key cursor-pointer ${
                          myVote === false
                            ? 'bg-[#FF4800] text-black border-[#FF4800] font-bold'
                            : 'bg-[#161922] text-zinc-400 border-white/[0.1] hover:text-white'
                        }`}
                      >
                        [REVOKE] ({scoreInfo.downvotes})
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono text-[9px] text-zinc-600">
                      [OWN_RECORD // READ_ONLY]
                    </span>
                  )}

                  {/* Host Master Override Key */}
                  {isHost && (
                    <button
                      onClick={() => handleHostOverride(player.id, cat.id, scoreInfo.isValid)}
                      className="flex items-center gap-1 font-mono text-[9px] text-zinc-400 hover:text-amber-300 border border-white/[0.08] px-2 py-1 bg-[#12141A] hardware-key cursor-pointer"
                      title="Host Override Switch"
                    >
                      <Gavel className="h-3 w-3" />
                      <span>{scoreInfo.isValid ? 'FORCE_INVALID' : 'FORCE_VALID'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
