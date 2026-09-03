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
  initSocketListeners: () => () => void;
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
        const socket = getSocket();
        socket.emit('game:answer_update', {
          roomCode: room.code,
          playerId,
          categoryId,
          value,
        });
      }
      return { localAnswers: nextAnswers };
    });
  },

  setAllLocalAnswers: (answers) => {
    set({ localAnswers: answers });
  },

  clearLocalAnswers: () => {
    set({ localAnswers: {} });
  },

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

  initSocketListeners: () => {
    const socket = getSocket();

    const onConnect = () => set({ isConnected: true });
    const onDisconnect = () => set({ isConnected: false });

    const onRoomSync = (syncedRoom: Room) => {
      const prevRoom = get().room;
      set({ room: syncedRoom });

      // Audio cues based on state transition
      if (prevRoom) {
        if (prevRoom.status !== 'COUNTDOWN' && syncedRoom.status === 'COUNTDOWN') {
          soundManager.playCountdownBeep(false);
        } else if (prevRoom.status !== 'REVIEW' && syncedRoom.status === 'REVIEW') {
          soundManager.playRoundComplete();
        } else if (prevRoom.status !== 'FINISHED' && syncedRoom.status === 'FINISHED') {
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
      if (timeRemaining <= 10 && timeRemaining > 0) {
        soundManager.playTick();
      }
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
      // Auto-submit remaining local answers when round ends
      const { room, playerId, localAnswers } = get();
      if (room && playerId) {
        socket.emit('game:answers_submit', {
          roomCode: room.code,
          playerId,
          answers: localAnswers,
        });
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

    if (socket.connected) {
      set({ isConnected: true });
    }

    return () => {
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
