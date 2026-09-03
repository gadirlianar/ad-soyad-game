'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Gavel } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { calculateRoundScores } from '@/lib/gameLogic';
import { tactileAudio } from '@/lib/audio';

export const PeerReviewList: React.FC = () => {
  const { room, playerId, sendGameAction } = useGameStore();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  if (!room) return null;

  const currentPlayer = room.players[playerId];
  const isHost = room.hostId === playerId || currentPlayer?.isHost;
  const categories = room.settings.categories;
  const activePlayers = Object.values(room.players).filter((p) => !p.isSpectator);
  const previewScores = calculateRoundScores(room);
  const activeCategory = categories[selectedCategoryIndex] || categories[0];

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

  const handleFinalize = () => {
    if (!isHost) return;
    tactileAudio.playRoundComplete();
    sendGameAction('finalize');
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
            Hərf: <span className="font-semibold text-neutral-900 dark:text-white">&quot;{room.currentLetter}&quot;</span> · Mübahisəli sözləri təsdiqləyin və ya rədd edin
          </p>
        </div>

        {isHost ? (
          <button
            onClick={handleFinalize}
            className="rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold px-5 py-2.5 shadow-[0_4px_14px_rgba(0,122,255,0.3)] transition-all cursor-pointer"
          >
            Tamamla və Davam Et
          </button>
        ) : (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            Host təsdiqlədikdə davam edəcək...
          </span>
        )}
      </div>

      {/* Apple Settings-Style Segmented Control */}
      <div className="flex overflow-x-auto p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl mb-6 scrollbar-none gap-1">
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

      {/* iOS Grouped List of Answers */}
      <div className="rounded-2xl bg-white/70 dark:bg-[#161618]/70 border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
        {activePlayers.map((player) => {
          const isMe = player.id === playerId;
          const scoreInfo = previewScores.scores[player.id]?.[activeCategory.id] || {
            value: '',
            isValid: false,
            reason: 'empty',
            points: 0,
            upvotes: 0,
            downvotes: 0,
          };
          const voteKey = `${player.id}_${activeCategory.id}`;
          const playerVotes = room.votes[voteKey] || {};
          const myVote = playerVotes[playerId];

          return (
            <div
              key={player.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Left: Player + Word */}
              <div className="flex items-center gap-3">
                <span className="text-xl">{player.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] text-neutral-400">· Sən</span>
                    )}
                  </div>
                  <span
                    className={`text-base font-semibold ${
                      scoreInfo.value.trim()
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-400 dark:text-neutral-600 italic'
                    }`}
                  >
                    {scoreInfo.value.trim() ? scoreInfo.value : 'Boşdur'}
                  </span>
                </div>
              </div>

              {/* Right: Badge & Voting Pills */}
              <div className="flex items-center gap-3 justify-between sm:justify-end">
                {/* Soft Muted Reason Badge */}
                <div className="flex items-center gap-1.5">
                  {scoreInfo.reason === 'duplicate' && (
                    <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium px-2.5 py-1 rounded-full">
                      Təkrar (+5)
                    </span>
                  )}
                  {scoreInfo.reason === 'solo' && (
                    <span className="bg-[#007AFF]/10 text-[#007AFF] text-xs font-semibold px-2.5 py-1 rounded-full">
                      Tək Cavab (+15)
                    </span>
                  )}
                  {scoreInfo.reason === 'unique' && (
                    <span className="bg-[#34C759]/10 text-[#34C759] text-xs font-medium px-2.5 py-1 rounded-full">
                      Unikal (+10)
                    </span>
                  )}
                  {!scoreInfo.isValid && (
                    <span className="bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-medium px-2.5 py-1 rounded-full">
                      0 xal
                    </span>
                  )}
                </div>

                {/* iOS-Style Toggle Pills */}
                {!isMe ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleVote(player.id, activeCategory.id, true)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        myVote === true
                          ? 'bg-[#34C759] text-white shadow-sm'
                          : 'bg-black/[0.04] dark:bg-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title="Qəbul et"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleVote(player.id, activeCategory.id, false)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        myVote === false
                          ? 'bg-[#FF3B30] text-white shadow-sm'
                          : 'bg-black/[0.04] dark:bg-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title="Rədd et"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-neutral-400">Öz cavabın</span>
                )}

                {/* Host Override Mini Key */}
                {isHost && (
                  <button
                    onClick={() =>
                      handleHostOverride(player.id, activeCategory.id, scoreInfo.isValid)
                    }
                    className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
                    title="Host Qərarını Dəyiş"
                  >
                    <Gavel className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
