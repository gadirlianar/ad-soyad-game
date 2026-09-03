'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  Gavel,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  Zap,
  Crown,
  LayoutGrid,
  Columns
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { calculateRoundScores } from '@/lib/gameLogic';
import { soundManager } from '@/lib/audio';
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
    soundManager.playVoteClick(approved);
    sendGameAction('vote', {
      voterId: playerId,
      targetPlayerId,
      categoryId,
      approved,
    });
  };

  const handleHostOverride = (targetPlayerId: string, categoryId: string, currentValid: boolean) => {
    if (!isHost) return;
    sendGameAction('override', {
      targetPlayerId,
      categoryId,
      isValid: !currentValid,
    });
  };

  const handleFinalizeReview = () => {
    if (!isHost) return;
    sendGameAction('finalize');
  };

  const renderReasonBadge = (score: CategoryScore) => {
    if (!score.isValid) {
      if (score.reason === 'empty') {
        return (
          <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-white/5">
            Boşdur (0 xal)
          </span>
        );
      }
      if (score.reason === 'wrong_letter') {
        return (
          <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
            Səhv hərf (0 xal)
          </span>
        );
      }
      if (score.reason === 'disapproved') {
        return (
          <span className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
            Rədd edildi (0 xal)
          </span>
        );
      }
      if (score.reason === 'host_override') {
        return (
          <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
            Host ləğv etdi (0 xal)
          </span>
        );
      }
    }

    if (score.reason === 'solo') {
      return (
        <span className="flex items-center gap-1 rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 border border-violet-500/30">
          <Zap className="h-2.5 w-2.5" /> Tək Cavab (+15 xal)
        </span>
      );
    }
    if (score.reason === 'duplicate') {
      return (
        <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
          Təkrar (+5 xal)
        </span>
      );
    }
    return (
      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
        Unikal (+10 xal)
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/[0.08] bg-[#08080a]/80 p-6 sm:p-8 backdrop-blur-xl mb-8 relative overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Demokratik Yoxlama Matrisi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Sözləri Yoxlayın və Qiymətləndirin
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
              Təkrar və unikal cavablar avtomatik ayrılıb. Mübahisəli sözləri səsvermə ilə təsdiqləyin və ya rədd edin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => setViewMode('carousel')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === 'carousel' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                }`}
                title="Karusel görünüşü"
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  viewMode === 'matrix' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                }`}
                title="Cədvəl görünüşü"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Host Finalize Action */}
            {isHost ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleFinalizeReview}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:brightness-110 flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
              >
                <Award className="h-4 w-4" />
                <span>Xalları Təsdiqlə</span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0e0e14] px-4 py-2.5 text-xs text-slate-300">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Host təsdiqlədikdə növbəti mərhələ açılacaq</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Carousel Navigation (If Carousel Mode) */}
      {viewMode === 'carousel' && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
              Kateqoriya {currentCategoryIndex + 1} / {categories.length}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeCategory?.azLabel}</span>
              <span className="rounded-lg bg-emerald-500/15 text-emerald-400 text-xs px-2 py-0.5 font-mono font-bold">
                &quot;{room.currentLetter}&quot; ilə
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentCategoryIndex === 0}
              onClick={() => setCurrentCategoryIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-xl border border-white/10 bg-[#0e0e14] p-2 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={currentCategoryIndex === categories.length - 1}
              onClick={() => setCurrentCategoryIndex((prev) => Math.min(categories.length - 1, prev + 1))}
              className="rounded-xl border border-white/10 bg-[#0e0e14] p-2 text-slate-300 hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <motion.div
                key={`${cat.id}_${player.id}`}
                layout
                className={`flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-xl transition ${
                  !scoreInfo.isValid
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : scoreInfo.points >= 15
                    ? 'border-violet-500/40 bg-violet-950/20'
                    : scoreInfo.points === 10
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-amber-500/30 bg-amber-950/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{player.avatar}</span>
                      <span className="text-xs font-bold text-white">{player.name}</span>
                      {isMe && (
                        <span className="rounded bg-emerald-500/20 px-1 text-[9px] font-bold text-emerald-400">
                          Siz
                        </span>
                      )}
                    </div>
                    {renderReasonBadge(scoreInfo)}
                  </div>

                  {/* Submitted Word */}
                  <div className="my-2 rounded-xl bg-[#08080a] p-3.5 border border-white/5">
                    <span className="text-base sm:text-lg font-bold tracking-wide text-white break-words">
                      {scoreInfo.value.trim() ? (
                        scoreInfo.value
                      ) : (
                        <span className="text-slate-600 italic">Cavab verilməyib</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Dispute / Peer Voting Toolbar */}
                <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      disabled={isMe || !scoreInfo.value.trim()}
                      onClick={() => handleVote(player.id, cat.id, true)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        myVote === true
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-white/[0.04] text-slate-400 hover:text-emerald-400'
                      } ${isMe ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{scoreInfo.upvotes}</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      disabled={isMe || !scoreInfo.value.trim()}
                      onClick={() => handleVote(player.id, cat.id, false)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                        myVote === false
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/[0.04] text-slate-400 hover:text-rose-400'
                      } ${isMe ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>{scoreInfo.downvotes}</span>
                    </motion.button>
                  </div>

                  {/* Host Override Gavel */}
                  {isHost && scoreInfo.value.trim() && (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleHostOverride(player.id, cat.id, scoreInfo.isValid)}
                      className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                        scoreInfo.isValid
                          ? 'border-rose-500/40 text-rose-400 hover:bg-rose-500/20'
                          : 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title="Host qərarı ilə dəyişdir"
                    >
                      <Gavel className="h-3 w-3" />
                      <span>{scoreInfo.isValid ? 'Ləğv et' : 'Təsdiqlə'}</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          });
        })}
      </div>
    </div>
  );
};
