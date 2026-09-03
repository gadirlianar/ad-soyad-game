'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { SpectatorBanner } from './SpectatorBanner';
import { SlotMachineReveal } from './SlotMachineReveal';
import { HeaderStatus } from './HeaderStatus';
import { GameInputDeck } from './GameInputDeck';
import { StopButton } from './StopButton';

export const GameArena: React.FC = () => {
  const {
    room,
    playerId,
    localAnswers,
    updateLocalAnswer,
    clearLocalAnswers,
    setNotification,
    sendGameAction,
  } = useGameStore();

  const isSpectator = room?.players[playerId]?.isSpectator;
  const currentLetter = room?.currentLetter || 'A';
  const categories = room?.settings.categories || [];
  const roundDuration = room?.settings.roundDuration || 60;
  const timeRemaining = room?.roundTimeRemaining ?? roundDuration;
  const graceRemaining = room?.graceTimeRemaining;
  const stoppedBy = room?.stoppedBy;

  // Reset local answers on countdown
  useEffect(() => {
    if (room?.status === 'COUNTDOWN') {
      clearLocalAnswers();
    }
  }, [room?.status, clearLocalAnswers]);

  if (!room) return null;

  // Dynamic Island Letter Reveal on COUNTDOWN
  if (room.status === 'COUNTDOWN') {
    return (
      <SlotMachineReveal
        targetLetter={room.currentLetter || 'A'}
        roundNumber={room.currentRound}
        countdownTime={room.countdownTime}
      />
    );
  }

  const filledCount = categories.filter((c) => (localAnswers[c.id] || '').trim().length > 0).length;
  const allFieldsFilled = filledCount === categories.length && categories.length > 0;
  const isStopping = graceRemaining !== null;

  const handleInputChange = (catId: string, val: string) => {
    if (isSpectator || (isStopping && graceRemaining === 0)) return;
    updateLocalAnswer(catId, val);
  };

  const handleStopButton = () => {
    if (!allFieldsFilled) {
      setNotification({
        type: 'warning',
        message: `Zəhmət olmasa bütün xanaları doldurun (${filledCount}/${categories.length})`,
      });
      return;
    }
    sendGameAction('stop');
  };

  const allPlayers = Object.values(room.players).filter((p) => !p.isSpectator);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col items-center">
      {isSpectator && <SpectatorBanner currentRound={room.currentRound} />}

      {/* Dynamic Island Header Status & Player Presence */}
      <HeaderStatus
        currentLetter={currentLetter}
        currentRound={room.currentRound}
        totalRounds={room.settings.totalRounds}
        timeRemaining={timeRemaining}
        totalDuration={roundDuration}
        players={allPlayers}
        currentPlayerId={playerId}
        playerAnswers={room.answers}
        totalCategories={categories.length}
      />

      {/* STOP Alert Banner during Grace Period */}
      {isStopping && (
        <div className="w-full max-w-2xl mb-6 rounded-2xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 p-3.5 flex items-center justify-between text-xs text-[#FF3B30] font-medium">
          <span>{stoppedBy?.name} STOP basdı! Son saniyələr:</span>
          <span className="font-bold tabular-nums bg-white dark:bg-black px-2.5 py-0.5 rounded-full">
            {graceRemaining}s
          </span>
        </div>
      )}

      {/* Apple Native Grouped Input Deck */}
      <GameInputDeck
        categories={categories}
        currentLetter={currentLetter}
        localAnswers={localAnswers}
        disabled={Boolean(isSpectator || (isStopping && graceRemaining === 0))}
        onAnswerChange={handleInputChange}
      />

      {/* Apple Watch Style Action Trigger */}
      {!isSpectator && (
        <div className="w-full mt-6">
          <StopButton
            isArmed={allFieldsFilled}
            isStopping={isStopping}
            filledCount={filledCount}
            totalCategories={categories.length}
            onStop={handleStopButton}
          />
        </div>
      )}
    </div>
  );
};
