export type GameStatus =
  | 'LOBBY'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'REVIEW'
  | 'SCOREBOARD'
  | 'FINISHED';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isReady: boolean;
  isSpectator: boolean;
  score: number;
  roundScores: Record<number, number>;
  isConnected: boolean;
}

export interface Category {
  id: string;
  label: string;
  azLabel: string;
  iconName: string;
  isCustom?: boolean;
}

export interface RoomSettings {
  roundDuration: number; // in seconds, 0 = unlimited until STOP
  totalRounds: number;
  categories: Category[];
  alphabet: string[];
  gracePeriodSeconds: number;
}

export type ScoreReason =
  | 'empty'
  | 'wrong_letter'
  | 'duplicate'
  | 'unique'
  | 'solo'
  | 'disapproved'
  | 'host_override';

export interface CategoryScore {
  value: string;
  isValid: boolean;
  reason: ScoreReason;
  points: number;
  upvotes: number;
  downvotes: number;
  hostOverride?: boolean;
}

export interface RoundResult {
  round: number;
  letter: string;
  stoppedBy?: {
    id: string;
    name: string;
  };
  scores: Record<string, Record<string, CategoryScore>>; // playerId -> categoryId -> CategoryScore
  roundTotals: Record<string, number>; // playerId -> points in this round
}

export interface Room {
  code: string;
  hostId: string;
  status: GameStatus;
  currentRound: number;
  currentLetter: string;
  usedLetters: string[];
  settings: RoomSettings;
  players: Record<string, Player>;
  answers: Record<string, Record<string, string>>; // playerId -> categoryId -> answer
  votes: Record<string, Record<string, boolean>>; // `${targetPlayerId}_${categoryId}` -> voterId -> boolean
  manualOverrides: Record<string, boolean>; // `${targetPlayerId}_${categoryId}` -> isValid
  roundResults: RoundResult[];
  countdownTime: number;
  roundTimeRemaining: number;
  graceTimeRemaining: number | null;
  stoppedBy: { id: string; name: string } | null;
  createdAt: number;
  countdownStartedAt?: number;
  playingStartedAt?: number;
  stopTriggeredAt?: number;
}

// Client-to-server events
export interface ClientToServerEvents {
  'room:create': (
    data: { player: { id: string; name: string; avatar: string }; settings?: Partial<RoomSettings> },
    callback: (response: { success: boolean; room?: Room; error?: string }) => void
  ) => void;
  'room:join': (
    data: { roomCode: string; player: { id: string; name: string; avatar: string } },
    callback: (response: { success: boolean; room?: Room; error?: string }) => void
  ) => void;
  'room:update_settings': (
    data: { roomCode: string; settings: Partial<RoomSettings> }
  ) => void;
  'player:ready': (
    data: { roomCode: string; playerId: string; isReady: boolean }
  ) => void;
  'game:start': (
    data: { roomCode: string }
  ) => void;
  'game:answer_update': (
    data: { roomCode: string; playerId: string; categoryId: string; value: string }
  ) => void;
  'game:answers_submit': (
    data: { roomCode: string; playerId: string; answers: Record<string, string> }
  ) => void;
  'game:stop': (
    data: { roomCode: string; playerId: string }
  ) => void;
  'review:vote': (
    data: { roomCode: string; voterId: string; targetPlayerId: string; categoryId: string; approved: boolean }
  ) => void;
  'review:host_override': (
    data: { roomCode: string; targetPlayerId: string; categoryId: string; isValid: boolean }
  ) => void;
  'review:finalize': (
    data: { roomCode: string }
  ) => void;
  'game:next_round': (
    data: { roomCode: string }
  ) => void;
  'game:play_again': (
    data: { roomCode: string }
  ) => void;
}

// Server-to-client events
export interface ServerToClientEvents {
  'room:sync': (room: Room) => void;
  'game:countdown_tick': (countdown: number) => void;
  'game:timer_tick': (timeRemaining: number) => void;
  'game:grace_tick': (graceRemaining: number) => void;
  'game:stop_triggered': (data: { stoppedBy: { id: string; name: string }; graceSeconds: number }) => void;
  'game:round_ended': () => void;
  'room:error': (message: string) => void;
  'notification': (data: { type: 'info' | 'success' | 'warning' | 'error'; message: string }) => void;
}
