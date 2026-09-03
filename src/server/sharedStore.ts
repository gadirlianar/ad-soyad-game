import {
  CategoryScore,
  Player,
  Room,
  RoomSettings,
  RoundResult,
} from '@/types/game';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { calculateRoundScores, generateRoomCode } from '@/lib/gameLogic';

// Use globalThis to persist rooms in memory across API route invocations
declare global {
  // eslint-disable-next-line no-var
  var __sharedRoomsStore__: Map<string, Room> | undefined;
}

if (!globalThis.__sharedRoomsStore__) {
  globalThis.__sharedRoomsStore__ = new Map<string, Room>();
}

export const roomsStore = globalThis.__sharedRoomsStore__;

/**
 * Reconciles serverless timer state based on timestamps
 */
export function reconcileRoomState(room: Room): Room {
  const now = Date.now();

  // If countdown is active
  if (room.status === 'COUNTDOWN') {
    const elapsed = Math.floor((now - (room.createdAt || now)) / 1000);
    const remaining = Math.max(0, 3 - elapsed);
    room.countdownTime = remaining;
    if (remaining <= 0) {
      room.status = 'PLAYING';
      // Mark start of playing phase
      room.createdAt = now;
      room.roundTimeRemaining = room.settings.roundDuration;
    }
  }

  // If playing phase is active
  if (room.status === 'PLAYING') {
    // If STOP was triggered with grace period
    if (room.graceTimeRemaining !== null && room.stoppedBy) {
      const elapsedGrace = Math.floor((now - (room.createdAt || now)) / 1000);
      const remainingGrace = Math.max(0, (room.settings.gracePeriodSeconds || 5) - elapsedGrace);
      room.graceTimeRemaining = remainingGrace;

      if (remainingGrace <= 0) {
        room.status = 'REVIEW';
        room.graceTimeRemaining = null;
      }
    } else if (room.settings.roundDuration > 0) {
      const elapsed = Math.floor((now - (room.createdAt || now)) / 1000);
      const remaining = Math.max(0, room.settings.roundDuration - elapsed);
      room.roundTimeRemaining = remaining;

      if (remaining <= 0) {
        room.status = 'REVIEW';
        room.graceTimeRemaining = null;
      }
    }
  }

  return room;
}

export function getSharedRoom(code: string): Room | null {
  const room = roomsStore.get(code.toUpperCase());
  if (!room) return null;
  return reconcileRoomState(room);
}

export function createSharedRoom(
  playerData: { id: string; name: string; avatar: string },
  customSettings?: Partial<RoomSettings>
): Room {
  let roomCode = generateRoomCode();
  while (roomsStore.has(roomCode)) {
    roomCode = generateRoomCode();
  }

  const host: Player = {
    id: playerData.id,
    socketId: '',
    name: playerData.name,
    avatar: playerData.avatar,
    isHost: true,
    isReady: true,
    isSpectator: false,
    score: 0,
    roundScores: {},
    isConnected: true,
  };

  const room: Room = {
    code: roomCode,
    hostId: playerData.id,
    status: 'LOBBY',
    currentRound: 1,
    currentLetter: '',
    usedLetters: [],
    settings: {
      ...DEFAULT_SETTINGS,
      ...customSettings,
    },
    players: {
      [playerData.id]: host,
    },
    answers: {},
    votes: {},
    manualOverrides: {},
    roundResults: [],
    countdownTime: 3,
    roundTimeRemaining: DEFAULT_SETTINGS.roundDuration,
    graceTimeRemaining: null,
    stoppedBy: null,
    createdAt: Date.now(),
  };

  roomsStore.set(roomCode, room);
  return room;
}

export function joinSharedRoom(
  roomCode: string,
  playerData: { id: string; name: string; avatar: string }
): { success: boolean; room?: Room; error?: string } {
  const code = roomCode.toUpperCase();
  const room = roomsStore.get(code);

  if (!room) {
    return { success: false, error: 'Otaq tapılmadı! Kodu yoxlayın.' };
  }

  reconcileRoomState(room);

  // Reconnection check
  if (room.players[playerData.id]) {
    const existing = room.players[playerData.id];
    existing.name = playerData.name || existing.name;
    existing.avatar = playerData.avatar || existing.avatar;
    existing.isConnected = true;
    return { success: true, room };
  }

  // New player joining
  const isGameInProgress = room.status !== 'LOBBY';
  const newPlayer: Player = {
    id: playerData.id,
    socketId: '',
    name: playerData.name,
    avatar: playerData.avatar,
    isHost: false,
    isReady: false,
    isSpectator: isGameInProgress,
    score: 0,
    roundScores: {},
    isConnected: true,
  };

  room.players[playerData.id] = newPlayer;
  return { success: true, room };
}

export function startSharedGame(roomCode: string, requesterId: string): { success: boolean; room?: Room; error?: string } {
  const room = getSharedRoom(roomCode);
  if (!room) return { success: false, error: 'Otaq tapılmadı.' };
  if (room.hostId !== requesterId) return { success: false, error: 'Yalnız host oyunu başlada bilər.' };

  for (const player of Object.values(room.players)) {
    player.isSpectator = false;
  }

  const alphabet = room.settings.alphabet;
  const available = alphabet.filter((l) => !room.usedLetters.includes(l));
  const pool = available.length > 0 ? available : alphabet;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  room.usedLetters.push(chosen);

  room.currentLetter = chosen;
  room.status = 'COUNTDOWN';
  room.countdownTime = 3;
  room.roundTimeRemaining = room.settings.roundDuration;
  room.graceTimeRemaining = null;
  room.stoppedBy = null;
  room.answers = {};
  room.votes = {};
  room.manualOverrides = {};
  room.createdAt = Date.now();

  for (const player of Object.values(room.players)) {
    room.answers[player.id] = {};
    for (const cat of room.settings.categories) {
      room.answers[player.id][cat.id] = '';
    }
  }

  return { success: true, room };
}

export function triggerSharedStop(roomCode: string, playerId: string): { success: boolean; room?: Room; error?: string } {
  const room = getSharedRoom(roomCode);
  if (!room || room.status !== 'PLAYING') {
    return { success: false, error: 'Oyun aktiv deyil.' };
  }

  if (room.graceTimeRemaining !== null) {
    return { success: false, error: 'STOP artıq basılıb!' };
  }

  const player = room.players[playerId];
  if (!player) return { success: false, error: 'Oyunçu tapılmadı.' };

  const playerAnswers = room.answers[playerId] || {};
  const filledCount = room.settings.categories.filter(
    (c) => (playerAnswers[c.id] || '').trim().length > 0
  ).length;

  if (filledCount < room.settings.categories.length) {
    return { success: false, error: 'STOP basmaq üçün bütün xanaları doldurmalısınız!' };
  }

  room.stoppedBy = { id: player.id, name: player.name };
  const graceSeconds = room.settings.gracePeriodSeconds || 5;
  room.graceTimeRemaining = graceSeconds;
  room.createdAt = Date.now(); // reset timer reference for grace period

  return { success: true, room };
}
