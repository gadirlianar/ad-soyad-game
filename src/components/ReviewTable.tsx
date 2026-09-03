'use client';

import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import { calculateRoundScores } from '@/lib/gameLogic';
import { soundManager } from '@/lib/audio';
import { Category, CategoryScore, ScoreReason } from '@/types/game';

export const ReviewTable: React.FC = () => {
  const { room, playerId } = useGameStore();
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  if (!room) return null;

  const currentPlayer = room.players[playerId];
  const isHost = currentPlayer?.isHost;
  const categories = room.settings.categories;
  const activePlayers = Object.values(room.players).filter((p) => !p.isSpectator);

  // Calculate live preview scores based on current votes and overrides
  const previewRoundResult = calculateRoundScores(room);

  const handleVote = (targetPlayerId: string, categoryId: string, approved: boolean) => {
    if (playerId === targetPlayerId) return; // Cannot vote on own answer
    soundManager.playVoteClick(approved);
    const socket = getSocket();
    socket.emit('review:vote', {
      roomCode: room.code,
      voterId: playerId,
      targetPlayerId,
      categoryId,
      approved,
    });
  };

  const handleHostOverride = (targetPlayerId: string, categoryId: string, currentValid: boolean) => {
    if (!isHost) return;
    const socket = getSocket();
    socket.emit('review:host_override', {
      roomCode: room.code,
      targetPlayerId,
      categoryId,
      isValid: !currentValid,
    });
  };

  const handleFinalizeReview = () => {
    if (!isHost) return;
    const socket = getSocket();
    socket.emit('review:finalize', { roomCode: room.code });
  };

  // Helper badge for scoring reason
  const renderReasonBadge = (score: CategoryScore) => {
    if (!score.isValid) {
      if (score.reason === 'empty') {
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
            Boşdur (0 xal)
          </span>
        );
      }
      if (score.reason === 'wrong_letter') {
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
            Səhv hərf (0 xal)
          </span>
        );
      }
      if (score.reason === 'disapproved') {
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
            Rədd edildi (0 xal)
          </span>
        );
      }
      if (score.reason === 'host_override') {
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
            Host ləğv etdi (0 xal)
          </span>
        );
      }
    }

    if (score.reason === 'solo') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-[11px] font-bold text-purple-300">
          <Zap className="h-3 w-3" /> Tək Cavab (+15 xal)
        </span>
      );
    }
    if (score.reason === 'duplicate') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
          Təkrar (+5 xal)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
        Unikal (+10 xal)
      </span>
    );
  };

  const displayedCategories =
    selectedCategoryTab === 'all'
      ? categories
      : categories.filter((c) => c.id === selectedCategoryTab);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Header Banner */}
      <div className="glass-panel mb-8 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Yoxlama və Xallama Mərhələsi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Cavabları Yoxlayın və Qiymətləndirin
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
              Sistem təkrar və unikal cavabları avtomatik hesabladı. Mübahisəli sözləri səsvermə ilə (👍 / 👎) təsdiqləyə və ya rədd edə bilərsiniz.
            </p>
          </div>

          {/* Host Finalize Action */}
          {isHost ? (
            <button
              onClick={handleFinalizeReview}
              className="tactile-btn rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3.5 font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:brightness-110 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <Award className="h-5 w-5" />
              <span>Xalları Təsdiqlə və Davam Et</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
              <Crown className="h-4 w-4 text-amber-400" />
              <span>Host xalları təsdiqlədikdə növbəti mərhələ açılacaq...</span>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setSelectedCategoryTab('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              selectedCategoryTab === 'all'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Bütün Kateqoriyalar
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryTab(cat.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                selectedCategoryTab === cat.id
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat.azLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Comparative Review Cards by Category */}
      <div className="space-y-6">
        {displayedCategories.map((cat) => (
          <div key={cat.id} className="glass-panel rounded-3xl p-5 sm:p-6 overflow-hidden">
            {/* Category Title Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 font-bold text-emerald-400">
                  {room.currentLetter}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{cat.azLabel}</span>
                    <span className="text-xs text-slate-500 font-normal">({cat.label})</span>
                  </h3>
                </div>
              </div>
            </div>

            {/* Players' Answers in this Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activePlayers.map((player) => {
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
                    key={player.id}
                    className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                      !scoreInfo.isValid
                        ? 'border-rose-500/30 bg-rose-950/10'
                        : scoreInfo.points >= 15
                        ? 'border-purple-500/40 bg-purple-950/20'
                        : scoreInfo.points === 10
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-amber-500/30 bg-amber-950/15'
                    }`}
                  >
                    <div>
                      {/* Player Profile Line */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{player.avatar}</span>
                          <span className="text-xs font-bold text-slate-200">{player.name}</span>
                          {isMe && (
                            <span className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400">
                              Sən
                            </span>
                          )}
                        </div>
                        {renderReasonBadge(scoreInfo)}
                      </div>

                      {/* Submitted Word */}
                      <div className="my-2 rounded-xl bg-slate-950/70 p-3 border border-white/5">
                        <span className="text-base sm:text-lg font-bold tracking-wide text-white break-words">
                          {scoreInfo.value.trim() ? scoreInfo.value : <span className="text-slate-600 italic">Cavab yazılmayıb</span>}
                        </span>
                      </div>
                    </div>

                    {/* Voting and Overrides Toolbar */}
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
                      {/* Peer Voting Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={isMe || !scoreInfo.value.trim()}
                          onClick={() => handleVote(player.id, cat.id, true)}
                          title="Qəbul et"
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            myVote === true
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-emerald-300'
                          } ${isMe ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>{scoreInfo.upvotes}</span>
                        </button>

                        <button
                          disabled={isMe || !scoreInfo.value.trim()}
                          onClick={() => handleVote(player.id, cat.id, false)}
                          title="Rədd et"
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            myVote === false
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-rose-300'
                          } ${isMe ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>{scoreInfo.downvotes}</span>
                        </button>
                      </div>

                      {/* Host Manual Override Button */}
                      {isHost && scoreInfo.value.trim() && (
                        <button
                          onClick={() => handleHostOverride(player.id, cat.id, scoreInfo.isValid)}
                          className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                            scoreInfo.isValid
                              ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/20'
                              : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {scoreInfo.isValid ? 'Ləğv et' : 'Təsdiqlə'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
