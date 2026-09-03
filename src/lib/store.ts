import { create } from 'zustand';
import { Room } from '@/types/game';
import { PLAYER_AVATARS } from './constants';
import { getSocket } from './socket';
import { soundManager } from './audio';

interface GameStoreState {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  room: Room | null;
  isConnected: boolean;
  isPolling: boolean;
  localAnswers: Record<string, string>;
  isMuted: boolean;
  notification: { type: 'info' | 'success' | 'warning' | 'error'; message: string } | null;

  // Actions
  initPlayer: () => void;
  setPlayerProfile: (name: string, avatar: string) => void;
  setRoom: (room: Room | null) => void;
  updateLocalAnswer: (categoryId: string, value: string) => void;
  setAllLocalAnswers: (answers: Record<string, string>) => void;
  clearLocalAnswers: () => void;
  toggleMute: () => void;
  setNotification: (notif: { type: 'info' | 'success' | 'warning' | 'error'; message: string } | null) => void;
  initSyncEngine: () => () => void;

  // Hybrid room operations
  createRoomApi: (
    player: { id: string; name: string; avatar: string },
    settings?: Record<string, unknown>
  ) => Promise<{ success: boolean; room?: Room; error?: string }>;
  joinRoomApi: (
    roomCode: string,
    player: { id: string; name: string; avatar: string }
  ) => Promise<{ success: boolean; room?: Room; error?: string }>;
  sendGameAction: (
    action: string,
    data?: Record<string, unknown>
  ) => Promise<{ success: boolean; room?: Room; error?: string }>;
}

function generatePlayerId(): string {
  if (typeof window === 'undefined') return 'p_' + Math.random().toString(36).substring(2, 9);
  let id = localStorage.getItem('ad_soyad_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('ad_soyad_player_id', id);
  }
  return id;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  playerId: '',
  playerName: '',
  playerAvatar: PLAYER_AVATARS[0],
  room: null,
  isConnected: false,
  isPolling: false,
  localAnswers: {},
  isMuted: false,
  notification: null,

  initPlayer: () => {
    if (typeof window === 'undefined') return;
    const id = generatePlayerId();
    const savedName = localStorage.getItem('ad_soyad_player_name') || '';
    const savedAvatar =
      localStorage.getItem('ad_soyad_player_avatar') ||
      PLAYER_AVATARS[Math.floor(Math.random() * PLAYER_AVATARS.length)];
    const savedMute = localStorage.getItem('sound_muted') === 'true';

    set({
      playerId: id,
      playerName: savedName,
      playerAvatar: savedAvatar,
      isMuted: savedMute,
    });
  },

  setPlayerProfile: (name: string, avatar: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ad_soyad_player_name', name);
      localStorage.setItem('ad_soyad_player_avatar', avatar);
    }
    set({ playerName: name, playerAvatar: avatar });
  },

  setRoom: (room) => {
    set({ room });
  },

  updateLocalAnswer: (categoryId: string, value: string) => {
    set((state) => {
      const nextAnswers = { ...state.localAnswers, [categoryId]: value };
      const { room, playerId } = state;
      if (room && playerId) {
        // Fast sync via socket
        const socket = getSocket();
        if (socket.connected) {
          socket.emit('game:answer_update', {
            roomCode: room.code,
            playerId,
            categoryId,
            value,
          });
        }
      }
      return { localAnswers: nextAnswers };
    });
  },

  setAllLocalAnswers: (answers) => set({ localAnswers: answers }),
  clearLocalAnswers: () => set({ localAnswers: {} }),

  toggleMute: () => {
    const nextMuted = soundManager.toggleMute();
    set({ isMuted: nextMuted });
  },

  setNotification: (notif) => {
    set({ notification: notif });
    if (notif) {
      setTimeout(() => {
        if (get().notification?.message === notif.message) {
          set({ notification: null });
        }
      }, 3500);
    }
  },

  createRoomApi: async (player, settings) => {
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player, settings }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        set({ room: data.room });
        // Join socket channel if socket is connected
        const socket = getSocket();
        if (socket.connected) {
          socket.emit('room:join', { roomCode: data.room.code, player }, () => {});
        }
        return { success: true, room: data.room };
      }
      return { success: false, error: data.error || 'Otaq yaradılmadı.' };
    } catch {
      // Fallback to socket directly
      return new Promise((resolve) => {
        const socket = getSocket();
        socket.emit('room:create', { player, settings }, (res) => {
          if (res.success && res.room) {
            set({ room: res.room });
            resolve({ success: true, room: res.room });
          } else {
            resolve({ success: false, error: res.error || 'Xəta baş verdi.' });
          }
        });
      });
    }
  },

  joinRoomApi: async (roomCode, player) => {
    try {
      const res = await fetch(`/api/room/${roomCode.toUpperCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', player }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        set({ room: data.room });
        const socket = getSocket();
        if (socket.connected) {
          socket.emit('room:join', { roomCode: data.room.code, player }, () => {});
        }
        return { success: true, room: data.room };
      }
      return { success: false, error: data.error || 'Otaq tapılmadı.' };
    } catch {
      return new Promise((resolve) => {
        const socket = getSocket();
        socket.emit('room:join', { roomCode, player }, (res) => {
          if (res.success && res.room) {
            set({ room: res.room });
            resolve({ success: true, room: res.room });
          } else {
            resolve({ success: false, error: res.error || 'Xəta baş verdi.' });
          }
        });
      });
    }
  },

  sendGameAction: async (action, actionData) => {
    const { room, playerId } = get();
    if (!room) return { success: false, error: 'Otaq yoxdur' };

    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: room.code,
          action,
          playerId,
          data: actionData,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        set({ room: data.room });
      }

      // Also fire via socket for instant broadcast
      const socket = getSocket();
      if (socket.connected) {
        if (action === 'start') socket.emit('game:start', { roomCode: room.code });
        if (action === 'stop') socket.emit('game:stop', { roomCode: room.code, playerId });
        if (action === 'vote' && actionData) {
          socket.emit('review:vote', {
            roomCode: room.code,
            voterId: String(actionData.voterId),
            targetPlayerId: String(actionData.targetPlayerId),
            categoryId: String(actionData.categoryId),
            approved: Boolean(actionData.approved),
          });
        }
        if (action === 'finalize') socket.emit('review:finalize', { roomCode: room.code });
        if (action === 'next_round') socket.emit('game:next_round', { roomCode: room.code });
        if (action === 'play_again') socket.emit('game:play_again', { roomCode: room.code });
      }

      return data;
    } catch {
      return { success: false, error: 'Şəbəkə xətası' };
    }
  },

  initSyncEngine: () => {
    const socket = getSocket();

    const onConnect = () => set({ isConnected: true, isPolling: false });
    const onDisconnect = () => set({ isConnected: false, isPolling: true });

    const onRoomSync = (syncedRoom: Room) => {
      const prev = get().room;
      set({ room: syncedRoom });

      if (prev) {
        if (prev.status !== 'COUNTDOWN' && syncedRoom.status === 'COUNTDOWN') {
          soundManager.playCountdownBeep(false);
        } else if (prev.status !== 'REVIEW' && syncedRoom.status === 'REVIEW') {
          soundManager.playRoundComplete();
        } else if (prev.status !== 'FINISHED' && syncedRoom.status === 'FINISHED') {
          soundManager.playVictoryFanfare();
        }
      }
    };

    const onCountdownTick = (countdown: number) => {
      set((state) => {
        if (!state.room) return state;
        return { room: { ...state.room, countdownTime: countdown } };
      });
      soundManager.playCountdownBeep(countdown === 0);
    };

    const onTimerTick = (timeRemaining: number) => {
      set((state) => {
        if (!state.room) return state;
        return { room: { ...state.room, roundTimeRemaining: timeRemaining } };
      });
      if (timeRemaining <= 10 && timeRemaining > 0) soundManager.playTick();
    };

    const onGraceTick = (graceRemaining: number) => {
      set((state) => {
        if (!state.room) return state;
        return { room: { ...state.room, graceTimeRemaining: graceRemaining } };
      });
      soundManager.playTick();
    };

    const onStopTriggered = (data: { stoppedBy: { id: string; name: string }; graceSeconds: number }) => {
      soundManager.playStopBuzzer();
      set((state) => {
        if (!state.room) return state;
        return {
          room: {
            ...state.room,
            stoppedBy: data.stoppedBy,
            graceTimeRemaining: data.graceSeconds,
          },
          notification: {
            type: 'warning',
            message: `🚨 ${data.stoppedBy.name} STOP basdı! 5 saniyə vaxtınız var!`,
          },
        };
      });
    };

    const onRoundEnded = () => {
      soundManager.playRoundComplete();
      const { room, playerId, localAnswers } = get();
      if (room && playerId) {
        get().sendGameAction('submit_answers', { answers: localAnswers });
      }
    };

    const onNotification = (data: { type: 'info' | 'success' | 'warning' | 'error'; message: string }) => {
      get().setNotification(data);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:sync', onRoomSync);
    socket.on('game:countdown_tick', onCountdownTick);
    socket.on('game:timer_tick', onTimerTick);
    socket.on('game:grace_tick', onGraceTick);
    socket.on('game:stop_triggered', onStopTriggered);
    socket.on('game:round_ended', onRoundEnded);
    socket.on('notification', onNotification);

    if (socket.connected) set({ isConnected: true });

    // Adaptive polling loop for serverless synchronization
    let isMounted = true;
    const pollLoop = async () => {
      while (isMounted) {
        const { room, isConnected } = get();
        // If room is open and either socket is not connected OR we are syncing state
        if (room?.code) {
          try {
            const res = await fetch(`/api/room/${room.code}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.room) {
                const prev = get().room;
                set({ room: data.room });

                // Audio cue transitions
                if (prev && prev.status !== data.room.status) {
                  if (data.room.status === 'COUNTDOWN') soundManager.playCountdownBeep(false);
                  if (data.room.status === 'REVIEW') soundManager.playRoundComplete();
                  if (data.room.status === 'FINISHED') soundManager.playVictoryFanfare();
                }

                // If STOP just got triggered during polling
                if (data.room.stoppedBy && !prev?.stoppedBy) {
                  soundManager.playStopBuzzer();
                  get().setNotification({
                    type: 'warning',
                    message: `🚨 ${data.room.stoppedBy.name} STOP basdı!`,
                  });
                }
              }
            }
          } catch {
            // Ignore temporary network errors
          }
        }

        // Interval timing: 1000ms during active playing, 1800ms otherwise
        const interval = get().room?.status === 'PLAYING' ? 1000 : 1800;
        await new Promise((r) => setTimeout(r, interval));
      }
    };

    pollLoop();

    return () => {
      isMounted = false;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room:sync', onRoomSync);
      socket.off('game:countdown_tick', onCountdownTick);
      socket.off('game:timer_tick', onTimerTick);
      socket.off('game:grace_tick', onGraceTick);
      socket.off('game:stop_triggered', onStopTriggered);
      socket.off('game:round_ended', onRoundEnded);
      socket.off('notification', onNotification);
    };
  },
}));
