import { CategoryScore, Room, RoundResult, ScoreReason } from '@/types/game';

/**
 * Normalizes text for comparison, handling Azerbaijani specific characters
 */
export function normalizeAzerbaijani(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('az');
}

/**
 * Checks if word begins with the chosen letter (case and locale insensitive)
 */
export function startsWithLetter(word: string, letter: string): boolean {
  if (!word || !letter) return false;
  const trimmed = word.trim();
  if (trimmed.length === 0) return false;

  const firstChar = trimmed[0].toLocaleLowerCase('az');
  const targetChar = letter.trim().toLocaleLowerCase('az');

  return firstChar === targetChar;
}

/**
 * Capitalizes word properly for display
 */
export function formatAnswerDisplay(word: string): string {
  if (!word) return '';
  const trimmed = word.trim();
  if (trimmed.length === 0) return '';
  const first = trimmed[0].toLocaleUpperCase('az');
  const rest = trimmed.slice(1);
  return first + rest;
}

/**
 * Generates a clean 6-character room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculates scores for all players in the room for the current round
 */
export function calculateRoundScores(room: Room): RoundResult {
  const { currentRound, currentLetter, players, answers, votes, manualOverrides, settings } = room;
  const activePlayers = Object.values(players).filter((p) => !p.isSpectator);
  const categories = settings.categories;

  const scores: Record<string, Record<string, CategoryScore>> = {};
  const roundTotals: Record<string, number> = {};

  // Initialize
  for (const player of activePlayers) {
    scores[player.id] = {};
    roundTotals[player.id] = 0;
  }

  // Process category by category across all players
  for (const cat of categories) {
    const catId = cat.id;

    // Collect and preprocess answers for this category
    const playerAnswerMap: Record<
      string,
      {
        raw: string;
        normalized: string;
        isValidInitial: boolean;
        initialReason: ScoreReason;
        upvotes: number;
        downvotes: number;
        hasHostOverride: boolean;
        hostOverrideValue?: boolean | number;
      }
    > = {};

    for (const player of activePlayers) {
      const rawAnswer = answers[player.id]?.[catId] || '';
      const normalized = normalizeAzerbaijani(rawAnswer);
      const voteKey = `${player.id}_${catId}`;
      const playerVotes = votes[voteKey] || {};

      let upvotes = 0;
      let downvotes = 0;
      for (const approved of Object.values(playerVotes)) {
        if (approved) upvotes++;
        else downvotes++;
      }

      const hasHostOverride = manualOverrides[voteKey] !== undefined;
      const hostOverrideValue = manualOverrides[voteKey];

      let isValidInitial = true;
      let initialReason: ScoreReason = 'unique';

      if (!rawAnswer.trim()) {
        isValidInitial = false;
        initialReason = 'empty';
      } else if (!startsWithLetter(rawAnswer, currentLetter)) {
        isValidInitial = false;
        initialReason = 'wrong_letter';
      }

      playerAnswerMap[player.id] = {
        raw: rawAnswer,
        normalized,
        isValidInitial,
        initialReason,
        upvotes,
        downvotes,
        hasHostOverride,
        hostOverrideValue,
      };
    }

    // Determine final validity considering peer votes & host overrides
    const validPlayersForCat: string[] = [];
    const normalizedCounts: Record<string, number> = {};

    for (const player of activePlayers) {
      const entry = playerAnswerMap[player.id];
      const voteKey = `${player.id}_${catId}`;
      const explicitPointOverride = room.manualPointOverrides?.[voteKey];
      const rawOverride = room.manualOverrides[voteKey];

      let isFinalValid = entry.isValidInitial;
      let finalReason: ScoreReason = entry.initialReason;

      if (explicitPointOverride !== undefined) {
        isFinalValid = explicitPointOverride > 0;
        finalReason = explicitPointOverride === 10 ? 'unique' : explicitPointOverride === 5 ? 'duplicate' : 'host_override';
      } else if (typeof rawOverride === 'number') {
        isFinalValid = rawOverride > 0;
        finalReason = rawOverride === 10 ? 'unique' : rawOverride === 5 ? 'duplicate' : 'host_override';
      } else if (rawOverride !== undefined) {
        isFinalValid = Boolean(rawOverride);
        if (!isFinalValid) finalReason = 'host_override';
      } else if (isFinalValid && entry.downvotes > entry.upvotes && entry.downvotes >= 1) {
        // Disapproved by peer voting
        isFinalValid = false;
        finalReason = 'disapproved';
      }

      if (isFinalValid && entry.normalized) {
        validPlayersForCat.push(player.id);
        normalizedCounts[entry.normalized] = (normalizedCounts[entry.normalized] || 0) + 1;
      }
    }

    // Assign points based on uniqueness / duplication / solo answer or host overrides
    for (const player of activePlayers) {
      const entry = playerAnswerMap[player.id];
      const voteKey = `${player.id}_${catId}`;
      const explicitPointOverride = room.manualPointOverrides?.[voteKey];
      const rawOverride = room.manualOverrides[voteKey];

      let isFinalValid = entry.isValidInitial;
      let reason: ScoreReason = entry.initialReason;
      let points = 0;

      if (explicitPointOverride !== undefined) {
        points = explicitPointOverride;
        isFinalValid = points > 0;
        reason = points === 10 ? 'unique' : points === 5 ? 'duplicate' : 'host_override';
      } else if (typeof rawOverride === 'number') {
        points = rawOverride;
        isFinalValid = points > 0;
        reason = points === 10 ? 'unique' : points === 5 ? 'duplicate' : 'host_override';
      } else if (rawOverride !== undefined) {
        isFinalValid = Boolean(rawOverride);
        if (!isFinalValid) {
          reason = 'host_override';
          points = 0;
        } else if (entry.normalized) {
          const duplicateCount = normalizedCounts[entry.normalized] || 0;
          if (duplicateCount > 1) {
            points = 5;
            reason = 'duplicate';
          } else {
            points = 10;
            reason = 'unique';
          }
        }
      } else if (isFinalValid && entry.downvotes > entry.upvotes && entry.downvotes >= 1) {
        isFinalValid = false;
        reason = 'disapproved';
        points = 0;
      } else if (isFinalValid && entry.normalized) {
        const duplicateCount = normalizedCounts[entry.normalized] || 0;
        if (duplicateCount > 1) {
          // Duplicate answer with another player
          points = 5;
          reason = 'duplicate';
        } else {
          // Valid unique answer (10 points as requested by user)
          points = 10;
          reason = 'unique';
        }
      } else {
        points = 0;
      }

      scores[player.id][catId] = {
        value: entry.raw,
        isValid: isFinalValid,
        reason,
        points,
        upvotes: entry.upvotes,
        downvotes: entry.downvotes,
        hostOverride: typeof rawOverride === 'boolean' ? rawOverride : typeof rawOverride === 'number' ? rawOverride > 0 : undefined,
      };

      roundTotals[player.id] += points;
    }
  }

  return {
    round: currentRound,
    letter: currentLetter,
    stoppedBy: room.stoppedBy || undefined,
    scores,
    roundTotals,
  };
}
