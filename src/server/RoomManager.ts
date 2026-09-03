import { Server as SocketIOServer } from 'socket.io';
import {
  CategoryScore,
  Player,
  Room,
  RoomSettings,
  RoundResult
} from '../types/game';
import { DEFAULT_SETTINGS } from '../lib/constants';
import {
  calculateRoundScores,
  generateRoomCode,
  normalizeAzerbaijani
} from '../lib/gameLogic';

export class RoomManager {
  private static instance: RoomManager;
  private rooms: Map<string, Room> = new Map();
  private countdownTimers: Map<string, NodeJS.Timeout> = new Map();
  private roundTimers: Map<string, NodeJS.Timeout> = new Map();
  private graceTimers: Map<string, NodeJS.Timeout> = new Map();
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  public setIO(io: SocketIOServer) {
    this.io = io;
  }

  private emitRoomSync(room: Room) {
    if (this.io) {
      this.io.to(room.code).emit('room:sync', room);
    }
  }

  public getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode.toUpperCase());
  }

  public createRoom(
    playerData: { id: string; name: string; avatar: string },
    socketId: string,
    customSettings?: Partial<RoomSettings>
  ): Room {
    let roomCode = generateRoomCode();
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const host: Player = {
      id: playerData.id,
      socketId,
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

    this.rooms.set(roomCode, room);
    return room;
  }

  public joinRoom(
    roomCode: string,
    playerData: { id: string; name: string; avatar: string },
    socketId: string
  ): { success: boolean; room?: Room; error?: string } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);

    if (!room) {
      return { success: false, error: 'Otaq tapılmadı! Kodu yoxlayın.' };
    }

    // Check if player is reconnecting
    if (room.players[playerData.id]) {
      const existingPlayer = room.players[playerData.id];
      existingPlayer.socketId = socketId;
      existingPlayer.isConnected = true;
      existingPlayer.name = playerData.name || existingPlayer.name;
      existingPlayer.avatar = playerData.avatar || existingPlayer.avatar;

      this.emitRoomSync(room);
      return { success: true, room };
    }

    // New player joining
    const isGameInProgress = room.status !== 'LOBBY';

    const newPlayer: Player = {
      id: playerData.id,
      socketId,
      name: playerData.name,
      avatar: playerData.avatar,
      isHost: false,
      isReady: false,
      isSpectator: isGameInProgress, // If game already active, join as spectator until next round
      score: 0,
      roundScores: {},
      isConnected: true,
    };

    room.players[playerData.id] = newPlayer;
    this.emitRoomSync(room);

    return { success: true, room };
  }

  public handleDisconnect(socketId: string) {
    const allRooms = Array.from(this.rooms.values());
    for (const room of allRooms) {
      const playerList = Object.values(room.players) as Player[];
      for (const player of playerList) {
        if (player.socketId === socketId) {
          player.isConnected = false;

          // If host disconnected, nominate another connected player if available
          if (player.isHost) {
            const nextHost = playerList.find(
              (p: Player) => p.id !== player.id && p.isConnected
            );
            if (nextHost) {
              player.isHost = false;
              nextHost.isHost = true;
              room.hostId = nextHost.id;
            }
          }

          this.emitRoomSync(room);
          break;
        }
      }
    }
  }

  public updateSettings(roomCode: string, settings: Partial<RoomSettings>, requesterId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== requesterId || room.status !== 'LOBBY') {
      return false;
    }

    room.settings = {
      ...room.settings,
      ...settings,
    };
    room.roundTimeRemaining = room.settings.roundDuration;

    this.emitRoomSync(room);
    return true;
  }

  public setPlayerReady(roomCode: string, playerId: string, isReady: boolean): boolean {
    const room = this.getRoom(roomCode);
    if (!room || !room.players[playerId]) return false;

    room.players[playerId].isReady = isReady;
    this.emitRoomSync(room);
    return true;
  }

  private pickNextLetter(room: Room): string {
    const alphabet = room.settings.alphabet;
    const available = alphabet.filter((l) => !room.usedLetters.includes(l));
    const pool = available.length > 0 ? available : alphabet;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    room.usedLetters.push(chosen);
    return chosen;
  }

  public startGame(roomCode: string, requesterId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== requesterId) return false;

    // Reset spectators into active players
    for (const player of Object.values(room.players)) {
      player.isSpectator = false;
    }

    this.initiateRound(room);
    return true;
  }

  private initiateRound(room: Room) {
    this.clearTimers(room.code);

    const letter = this.pickNextLetter(room);
    room.currentLetter = letter;
    room.status = 'COUNTDOWN';
    room.countdownTime = 3;
    room.roundTimeRemaining = room.settings.roundDuration;
    room.graceTimeRemaining = null;
    room.stoppedBy = null;
    room.answers = {};
    room.votes = {};
    room.manualOverrides = {};

    // Initialize answer maps for each active player
    for (const player of Object.values(room.players)) {
      if (!player.isSpectator) {
        room.answers[player.id] = {};
        for (const cat of room.settings.categories) {
          room.answers[player.id][cat.id] = '';
        }
      }
    }

    this.emitRoomSync(room);

    // 3-2-1 Countdown Ticker
    const countdownInterval = setInterval(() => {
      room.countdownTime -= 1;

      if (this.io) {
        this.io.to(room.code).emit('game:countdown_tick', room.countdownTime);
      }

      if (room.countdownTime <= 0) {
        clearInterval(countdownInterval);
        this.countdownTimers.delete(room.code);
        this.startPlayingPhase(room);
      } else {
        this.emitRoomSync(room);
      }
    }, 1000);

    this.countdownTimers.set(room.code, countdownInterval);
  }

  private startPlayingPhase(room: Room) {
    room.status = 'PLAYING';
    room.roundTimeRemaining = room.settings.roundDuration;
    this.emitRoomSync(room);

    // If duration is 0 (unlimited until STOP), don't tick timer
    if (room.settings.roundDuration > 0) {
      const roundInterval = setInterval(() => {
        // If grace period is running, the grace interval handles termination
        if (room.graceTimeRemaining !== null) {
          return;
        }

        room.roundTimeRemaining -= 1;

        if (this.io) {
          this.io.to(room.code).emit('game:timer_tick', room.roundTimeRemaining);
        }

        if (room.roundTimeRemaining <= 0) {
          clearInterval(roundInterval);
          this.roundTimers.delete(room.code);
          this.endRound(room.code);
        }
      }, 1000);

      this.roundTimers.set(room.code, roundInterval);
    }
  }

  public updateAnswer(roomCode: string, playerId: string, categoryId: string, value: string) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'PLAYING') return;

    if (!room.answers[playerId]) {
      room.answers[playerId] = {};
    }
    room.answers[playerId][categoryId] = value;
  }

  public submitAllAnswers(roomCode: string, playerId: string, answers: Record<string, string>) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    if (!room.answers[playerId]) {
      room.answers[playerId] = {};
    }
    room.answers[playerId] = {
      ...room.answers[playerId],
      ...answers,
    };
  }

  public triggerStop(roomCode: string, playerId: string): { success: boolean; error?: string } {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'PLAYING') {
      return { success: false, error: 'Oyun hazırda getmir.' };
    }

    if (room.graceTimeRemaining !== null) {
      return { success: false, error: 'STOP artıq basılıb!' };
    }

    const player = room.players[playerId];
    if (!player) {
      return { success: false, error: 'Oyunçu tapılmadı.' };
    }

    const playerAnswers = room.answers[playerId] || {};
    const filledCount = room.settings.categories.filter(
      (c) => (playerAnswers[c.id] || '').trim().length > 0
    ).length;

    if (filledCount < room.settings.categories.length) {
      return { success: false, error: 'STOP basmaq üçün bütün xanaları doldurmalısınız!' };
    }

    // Set STOP state & trigger grace period countdown
    room.stoppedBy = { id: player.id, name: player.name };
    const graceSeconds = room.settings.gracePeriodSeconds || 5;
    room.graceTimeRemaining = graceSeconds;

    if (this.io) {
      this.io.to(room.code).emit('game:stop_triggered', {
        stoppedBy: room.stoppedBy,
        graceSeconds,
      });
    }

    this.emitRoomSync(room);

    // Grace period ticker
    const graceInterval = setInterval(() => {
      if (room.graceTimeRemaining === null) {
        clearInterval(graceInterval);
        return;
      }

      room.graceTimeRemaining -= 1;

      if (this.io) {
        this.io.to(room.code).emit('game:grace_tick', room.graceTimeRemaining);
      }

      if (room.graceTimeRemaining <= 0) {
        clearInterval(graceInterval);
        this.graceTimers.delete(room.code);
        this.endRound(room.code);
      } else {
        this.emitRoomSync(room);
      }
    }, 1000);

    this.graceTimers.set(room.code, graceInterval);
    return { success: true };
  }

  public endRound(roomCode: string) {
    const room = this.getRoom(roomCode);
    if (!room) return;

    this.clearTimers(room.code);
    room.status = 'REVIEW';
    room.graceTimeRemaining = null;

    if (this.io) {
      this.io.to(room.code).emit('game:round_ended');
    }

    this.emitRoomSync(room);
  }

  public vote(
    roomCode: string,
    voterId: string,
    targetPlayerId: string,
    categoryId: string,
    approved: boolean
  ) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'REVIEW') return;

    // Don't allow voting on one's own answer
    if (voterId === targetPlayerId) return;

    const voteKey = `${targetPlayerId}_${categoryId}`;
    if (!room.votes[voteKey]) {
      room.votes[voteKey] = {};
    }

    // Toggle vote if clicked again with same approval
    if (room.votes[voteKey][voterId] === approved) {
      delete room.votes[voteKey][voterId];
    } else {
      room.votes[voteKey][voterId] = approved;
    }

    this.emitRoomSync(room);
  }

  public hostOverride(roomCode: string, targetPlayerId: string, categoryId: string, isValid: boolean) {
    const room = this.getRoom(roomCode);
    if (!room || room.status !== 'REVIEW') return;

    const voteKey = `${targetPlayerId}_${categoryId}`;
    if (room.manualOverrides[voteKey] === isValid) {
      delete room.manualOverrides[voteKey];
    } else {
      room.manualOverrides[voteKey] = isValid;
    }

    this.emitRoomSync(room);
  }

  public finalizeReview(roomCode: string, requesterId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== requesterId || room.status !== 'REVIEW') return false;

    // Calculate final scores for this round
    const roundResult = calculateRoundScores(room);
    room.roundResults.push(roundResult);

    // Update cumulative player scores
    for (const [playerId, points] of Object.entries(roundResult.roundTotals)) {
      if (room.players[playerId]) {
        room.players[playerId].score += points;
        room.players[playerId].roundScores[room.currentRound] = points;
      }
    }

    // Check if game is finished
    if (room.currentRound >= room.settings.totalRounds) {
      room.status = 'FINISHED';
    } else {
      room.status = 'SCOREBOARD';
    }

    this.emitRoomSync(room);
    return true;
  }

  public nextRound(roomCode: string, requesterId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== requesterId || room.status !== 'SCOREBOARD') return false;

    room.currentRound += 1;
    this.initiateRound(room);
    return true;
  }

  public playAgain(roomCode: string, requesterId: string): boolean {
    const room = this.getRoom(roomCode);
    if (!room || room.hostId !== requesterId || room.status !== 'FINISHED') return false;

    this.clearTimers(room.code);
    room.status = 'LOBBY';
    room.currentRound = 1;
    room.currentLetter = '';
    room.usedLetters = [];
    room.answers = {};
    room.votes = {};
    room.manualOverrides = {};
    room.roundResults = [];
    room.stoppedBy = null;
    room.graceTimeRemaining = null;

    for (const player of Object.values(room.players)) {
      player.score = 0;
      player.roundScores = {};
      player.isReady = player.isHost;
      player.isSpectator = false;
    }

    this.emitRoomSync(room);
    return true;
  }

  private clearTimers(roomCode: string) {
    const cd = this.countdownTimers.get(roomCode);
    if (cd) {
      clearInterval(cd);
      this.countdownTimers.delete(roomCode);
    }
    const rt = this.roundTimers.get(roomCode);
    if (rt) {
      clearInterval(rt);
      this.roundTimers.delete(roomCode);
    }
    const gt = this.graceTimers.get(roomCode);
    if (gt) {
      clearInterval(gt);
      this.graceTimers.delete(roomCode);
    }
  }
}
