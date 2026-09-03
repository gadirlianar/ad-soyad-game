'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { calculateRoundScores } from '@/lib/gameLogic';
import { tactileAudio } from '@/lib/audio';

export const PeerReviewList: React.FC = () => {
  const { room, playerId, localAnswers, sendGameAction } = useGameStore();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // If localAnswers has data but room.answers doesn't have it yet, immediately push to server
  useEffect(() => {
    if (!room || !playerId) return;
    const myServerAnswers = room.answers[playerId] || {};
    const hasLocalContent = Object.values(localAnswers).some((v) => (v || '').trim().length > 0);
    const hasServerContent = Object.values(myServerAnswers).some((v) => (v || '').trim().length > 0);

    if (hasLocalContent && !hasServerContent) {
      sendGameAction('submit_answers', { answers: localAnswers });
    }
  }, [room, playerId, localAnswers, sendGameAction]);

  if (!room) return null;

  const currentPlayer = room.players[playerId];
  const isHost = Boolean(room.hostId === playerId || currentPlayer?.isHost);
  const categories = room.settings.categories;
  const activePlayers = Object.values(room.players).filter((p) => !p.isSpectator);
  const previewScores = calculateRoundScores(room);
  const activeCategory = categories[selectedCategoryIndex] || categories[0];

  // Host direct score assignment (0 xal, 5 xal, 10 xal)
  const handleHostSetPoints = (targetPlayerId: string, categoryId: string, points: number) => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    sendGameAction('set_points', {
      targetPlayerId,
      categoryId,
      points,
    });
  };

  // Peer voting for non-hosts
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

  const handleFinalize = () => {
    if (!isHost) return;
    tactileAudio.playRoundComplete();
    sendGameAction('finalize');
  };

  const handlePrevCategory = () => {
    tactileAudio.playKeyStroke();
    setSelectedCategoryIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextCategory = () => {
    tactileAudio.playKeyStroke();
    setSelectedCategoryIndex((prev) => Math.min(categories.length - 1, prev + 1));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 select-none">
      {/* Cupertino Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Cavabları Yoxlayın
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Hərf: <span className="font-semibold text-neutral-900 dark:text-white">&quot;{room.currentLetter}&quot;</span> · {isHost ? 'Xalları təyin edin və ya dəyişin (0, 5, 10)' : 'Mübahisəli sözləri səsvermə ilə təsdiqləyin'}
          </p>
        </div>

        {isHost ? (
          <button
            onClick={handleFinalize}
            className="rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold px-5 py-2.5 shadow-[0_4px_14px_rgba(0,122,255,0.3)] transition-all cursor-pointer"
          >
            Tamamla və Növbətiyə Keç
          </button>
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Host təsdiqlədikdə davam edəcək...
          </span>
        )}
      </div>

      {/* Apple Settings-Style Segmented Control for Categories */}
      <div className="flex overflow-x-auto p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl mb-4 scrollbar-none gap-1">
        {categories.map((cat, idx) => {
          const isSelected = idx === selectedCategoryIndex;
          return (
            <button
              key={cat.id}
              onClick={() => {
                tactileAudio.playKeyStroke();
                setSelectedCategoryIndex(idx);
              }}
              className={`relative px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'text-neutral-900 dark:text-white font-semibold'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeSegment"
                  transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                  className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm -z-10"
                />
              )}
              <span>{cat.azLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Category Navigation Arrows */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={handlePrevCategory}
          disabled={selectedCategoryIndex === 0}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Əvvəlki</span>
        </button>

        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {activeCategory.azLabel} ({selectedCategoryIndex + 1} / {categories.length})
        </span>

        <button
          onClick={handleNextCategory}
          disabled={selectedCategoryIndex === categories.length - 1}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <span>Növbəti</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* iOS Grouped List of Answers */}
      <div className="rounded-2xl bg-white/70 dark:bg-[#161618]/70 border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        {activePlayers.map((player) => {
          const isMe = player.id === playerId;
          
          // Look up answer from score calculation, room.answers, or localAnswers fallback
          const rawVal =
            room.answers[player.id]?.[activeCategory.id] ||
            (isMe ? localAnswers[activeCategory.id] : '') ||
            '';

          const scoreInfo = previewScores.scores[player.id]?.[activeCategory.id] || {
            value: rawVal,
            isValid: false,
            reason: 'empty',
            points: 0,
            upvotes: 0,
            downvotes: 0,
          };

          const answerText = rawVal.trim() || scoreInfo.value.trim();
          const voteKey = `${player.id}_${activeCategory.id}`;
          const currentPoints = scoreInfo.points;

          return (
            <div
              key={player.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-black/[0.01] dark:hover:bg-white/[0.02]"
            >
              {/* Left: Player + Written Word */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl shrink-0">{player.avatar}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {player.name}
                    </span>
                    {isMe && <span className="text-[10px] text-neutral-400">· Sən</span>}
                    <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 tabular-nums">
                      (Raund: +{previewScores.roundTotals[player.id] || 0} xal)
                    </span>
                  </div>
                  <span
                    className={`text-base font-semibold block truncate ${
                      answerText
                        ? 'text-neutral-900 dark:text-white font-bold'
                        : 'text-neutral-400 dark:text-neutral-600 italic font-normal'
                    }`}
                  >
                    {answerText || 'Boşdur'}
                  </span>
                </div>
              </div>

              {/* Right: Points Display & Host Point Controls */}
              <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
                {/* Status Badges for all users */}
                <div className="flex items-center gap-1">
                  {scoreInfo.reason === 'duplicate' && (
                    <span className="bg-[#FF9500]/10 text-[#FF9500] text-[11px] font-medium px-2 py-0.5 rounded-full">
                      Təkrar
                    </span>
                  )}
                  {scoreInfo.reason === 'unique' && (
                    <span className="bg-[#34C759]/10 text-[#34C759] text-[11px] font-medium px-2 py-0.5 rounded-full">
                      Unikal
                    </span>
                  )}
                  {scoreInfo.reason === 'solo' && (
                    <span className="bg-[#007AFF]/10 text-[#007AFF] text-[11px] font-medium px-2 py-0.5 rounded-full">
                      Tək Cavab
                    </span>
                  )}
                </div>

                {/* HOST DIRECT POINT CONTROLS (0 xal, 5 xal, 10 xal) */}
                {isHost ? (
                  <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-xl">
                    <button
                      onClick={() => handleHostSetPoints(player.id, activeCategory.id, 0)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentPoints === 0
                          ? 'bg-[#FF3B30] text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title="0 xal ver (Boş / Yanlış)"
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleHostSetPoints(player.id, activeCategory.id, 5)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentPoints === 5
                          ? 'bg-[#FF9500] text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title="5 xal ver (Eyni / Təkrar)"
                    >
                      5
                    </button>
                    <button
                      onClick={() => handleHostSetPoints(player.id, activeCategory.id, 10)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentPoints === 10
                          ? 'bg-[#34C759] text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title="10 xal ver (Unikal / Düzgün)"
                    >
                      10
                    </button>
                    <button
                      onClick={() => handleHostSetPoints(player.id, activeCategory.id, 15)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentPoints === 15
                          ? 'bg-[#007AFF] text-white shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title="15 xal ver (Tək / Xüsusi)"
                    >
                      15
                    </button>
                  </div>
                ) : (
                  /* Non-Host Points Badge */
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full tabular-nums ${
                        currentPoints === 10
                          ? 'bg-[#34C759]/15 text-[#34C759]'
                          : currentPoints === 5
                          ? 'bg-[#FF9500]/15 text-[#FF9500]'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {currentPoints} xal
                    </span>

                    {/* Non-Host Peer Vote Buttons */}
                    {!isMe && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleVote(player.id, activeCategory.id, true)}
                          className={`h-7 w-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                            room.votes[voteKey]?.[playerId] === true
                              ? 'bg-[#34C759] text-white'
                              : 'bg-black/[0.04] dark:bg-white/[0.08] text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleVote(player.id, activeCategory.id, false)}
                          className={`h-7 w-7 rounded-full flex items-center justify-center transition cursor-pointer ${
                            room.votes[voteKey]?.[playerId] === false
                              ? 'bg-[#FF3B30] text-white'
                              : 'bg-black/[0.04] dark:bg-white/[0.08] text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
