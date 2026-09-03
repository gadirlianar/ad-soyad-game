import {
  CategoryScore,
  Player,
  Room,
  RoomSettings,
  RoundResult,
} from '@/types/game';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import { calculateRoundScores, generateRoomCode } from '@/lib/gameLogic';

// In-memory fallback
declare global {
  // eslint-disable-next-line no-var
  var __sharedRoomsStore__: Map<string, Room> | undefined;
}

if (!globalThis.__sharedRoomsStore__) {
  globalThis.__sharedRoomsStore__ = new Map<string, Room>();
}

export const inMemoryStore = globalThis.__sharedRoomsStore__;

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL || 'https://growing-colt-140910.upstash.io';
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  'gQAAAAAAAiZuAQIgcDI4MzU5MmE4Y2QyYmU0YjhhYWU2MGZiZmRhMWM5YjQ2Yg';

/**
 * Executes a Redis command via the Upstash REST API
 */
async function redisCommand(...args: (string | number)[]): Promise<unknown> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(REDIS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

/**
 * Saves a room to persistent Redis with a 24-hour expiration
 */
export async function saveRoom(room: Room): Promise<void> {
  const code = room.code.toUpperCase();
  inMemoryStore.set(code, room);

  try {
    const serialized = JSON.stringify(room);
    await redisCommand('SET', `ad_soyad_room:${code}`, serialized, 'EX', 86400);
  } catch (err) {
    console.error('Failed to save room to Redis:', err);
  }
}

/**
 * Fetches a room from Redis or in-memory store.
 * Reconciles serverless timer state and persists any state transitions.
 */
export async function fetchRoom(code: string): Promise<Room | null> {
  const normalized = code.toUpperCase();

  let room: Room | null = null;

  try {
    const result = (await redisCommand('GET', `ad_soyad_room:${normalized}`)) as string | null;
    if (result) {
      room = JSON.parse(result) as Room;
      inMemoryStore.set(normalized, room);
    }
  } catch (err) {
    console.error('Failed to fetch room from Redis:', err);
  }

  // Fallback to in-memory store
  if (!room) {
    const local = inMemoryStore.get(normalized);
    if (!local) return null;
    room = local;
  }

  // Reconcile timer state and persist if any state transition occurred
  const prevStatus = room.status;
  const prevPlayingStartedAt = room.playingStartedAt;
  reconcileRoomState(room);

  // If reconciliation caused a state transition, persist immediately
  const stateChanged = room.status !== prevStatus || room.playingStartedAt !== prevPlayingStartedAt;
  if (stateChanged) {
    await saveRoom(room);
  }

  return room;
}

/**
 * Reconciles serverless timer state based on timestamps
 */
export function reconcileRoomState(room: Room): Room {
  const now = Date.now();

  // If countdown is active
  if (room.status === 'COUNTDOWN') {
    const startedAt = room.countdownStartedAt || room.createdAt || now;
    const elapsed = Math.floor((now - startedAt) / 1000);
    const remaining = Math.max(0, 3 - elapsed);
    room.countdownTime = remaining;
    if (remaining <= 0) {
      room.status = 'PLAYING';
      room.playingStartedAt = now;
      room.roundTimeRemaining = room.settings.roundDuration;
    }
  }

  // If playing phase is active
  if (room.status === 'PLAYING') {
    if (room.graceTimeRemaining !== null && room.stoppedBy) {
      // Grace period after STOP
      const stopAt = room.stopTriggeredAt || room.playingStartedAt || now;
      const elapsedGrace = Math.floor((now - stopAt) / 1000);
      const remainingGrace = Math.max(0, (room.settings.gracePeriodSeconds || 5) - elapsedGrace);
      room.graceTimeRemaining = remainingGrace;

      if (remainingGrace <= 0) {
        room.status = 'REVIEW';
        room.graceTimeRemaining = null;
      }
    } else if (room.settings.roundDuration > 0) {
      // Normal countdown timer
      const playAt = room.playingStartedAt || room.createdAt || now;
      const elapsed = Math.floor((now - playAt) / 1000);
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

export async function createSharedRoom(
  playerData: { id: string; name: string; avatar: string },
  customSettings?: Partial<RoomSettings>
): Promise<Room> {
  let roomCode = generateRoomCode();
  let existing = await fetchRoom(roomCode);
  while (existing) {
    roomCode = generateRoomCode();
    existing = await fetchRoom(roomCode);
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

  await saveRoom(room);
  return room;
}

export async function joinSharedRoom(
  roomCode: string,
  playerData: { id: string; name: string; avatar: string }
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const code = roomCode.toUpperCase();
  const room = await fetchRoom(code);

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
    await saveRoom(room);
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
  await saveRoom(room);
  return { success: true, room };
}

export async function updateSharedSettings(
  roomCode: string,
  requesterId: string,
  newSettings: Partial<RoomSettings>
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const room = await fetchRoom(roomCode);
  if (!room) return { success: false, error: 'Otaq tapılmadı.' };

  // Host verification
  if (room.hostId !== requesterId && !room.players[requesterId]?.isHost) {
    return { success: false, error: 'Yalnız host tənzimləmələri dəyişə bilər.' };
  }

  room.settings = {
    ...room.settings,
    ...newSettings,
  };
  room.roundTimeRemaining = room.settings.roundDuration;

  await saveRoom(room);
  return { success: true, room };
}

export async function setSharedPlayerReady(
  roomCode: string,
  playerId: string,
  isReady: boolean
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const room = await fetchRoom(roomCode);
  if (!room) return { success: false, error: 'Otaq tapılmadı.' };

  if (room.players[playerId]) {
    room.players[playerId].isReady = isReady;
    await saveRoom(room);
    return { success: true, room };
  }

  return { success: false, error: 'Oyunçu tapılmadı.' };
}

export async function startSharedGame(
  roomCode: string,
  requesterId: string
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const room = await fetchRoom(roomCode);
  if (!room) return { success: false, error: 'Otaq tapılmadı.' };

  if (room.hostId !== requesterId && !room.players[requesterId]?.isHost) {
    return { success: false, error: 'Yalnız host oyunu başlada bilər.' };
  }

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
  room.countdownStartedAt = Date.now();
  room.playingStartedAt = undefined;
  room.stopTriggeredAt = undefined;

  for (const player of Object.values(room.players)) {
    room.answers[player.id] = {};
    for (const cat of room.settings.categories) {
      room.answers[player.id][cat.id] = '';
    }
  }

  await saveRoom(room);
  return { success: true, room };
}

export async function triggerSharedStop(
  roomCode: string,
  playerId: string,
  answers?: Record<string, string>
): Promise<{ success: boolean; room?: Room; error?: string }> {
  const room = await fetchRoom(roomCode);
  if (!room || room.status !== 'PLAYING') {
    return { success: false, error: 'Oyun aktiv deyil.' };
  }

  if (room.graceTimeRemaining !== null) {
    return { success: false, error: 'STOP artıq basılıb!' };
  }

  const player = room.players[playerId];
  if (!player) return { success: false, error: 'Oyunçu tapılmadı.' };

  // If client passed answers, save them immediately
  if (answers && typeof answers === 'object') {
    if (!room.answers[playerId]) room.answers[playerId] = {};
    room.answers[playerId] = { ...room.answers[playerId], ...answers };
  }

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
  room.stopTriggeredAt = Date.now();

  await saveRoom(room);
  return { success: true, room };
}
