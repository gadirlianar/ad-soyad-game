import { Server as SocketIOServer, Socket } from 'socket.io';
import { RoomManager } from './RoomManager';
import { ClientToServerEvents, ServerToClientEvents } from '../types/game';

export function setupSocketHandlers(
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>
) {
  const roomManager = RoomManager.getInstance();
  roomManager.setIO(io as unknown as SocketIOServer);

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    // Room creation
    socket.on('room:create', ({ player, settings }, callback) => {
      try {
        const room = roomManager.createRoom(player, socket.id, settings);
        socket.join(room.code);
        callback({ success: true, room });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Otaq yaradıla bilmədi.';
        callback({ success: false, error: message });
      }
    });

    // Room join / rejoin
    socket.on('room:join', ({ roomCode, player }, callback) => {
      try {
        const code = roomCode.toUpperCase();
        const result = roomManager.joinRoom(code, player, socket.id);
        if (result.success && result.room) {
          socket.join(result.room.code);
          callback({ success: true, room: result.room });
        } else {
          callback({ success: false, error: result.error });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Otağa qoşularkən xəta baş verdi.';
        callback({ success: false, error: message });
      }
    });

    // Update settings (host only)
    socket.on('room:update_settings', ({ roomCode, settings }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      // Identify requester by socketId
      const player = Object.values(room.players).find((p) => p.socketId === socket.id);
      if (player && player.isHost) {
        roomManager.updateSettings(roomCode, settings, player.id);
      }
    });

    // Toggle player ready status
    socket.on('player:ready', ({ roomCode, playerId, isReady }) => {
      roomManager.setPlayerReady(roomCode, playerId, isReady);
    });

    // Start game
    socket.on('game:start', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = Object.values(room.players).find((p) => p.socketId === socket.id);
      if (player && player.isHost) {
        roomManager.startGame(roomCode, player.id);
      }
    });

    // Answer character input update (debounced/real-time sync)
    socket.on('game:answer_update', ({ roomCode, playerId, categoryId, value }) => {
      roomManager.updateAnswer(roomCode, playerId, categoryId, value);
    });

    // Submit all answers
    socket.on('game:answers_submit', ({ roomCode, playerId, answers }) => {
      roomManager.submitAllAnswers(roomCode, playerId, answers);
    });

    // Trigger STOP / BİTDİ
    socket.on('game:stop', ({ roomCode, playerId }) => {
      const result = roomManager.triggerStop(roomCode, playerId);
      if (!result.success && result.error) {
        socket.emit('notification', { type: 'warning', message: result.error });
      }
    });

    // Peer voting during review
    socket.on('review:vote', ({ roomCode, voterId, targetPlayerId, categoryId, approved }) => {
      roomManager.vote(roomCode, voterId, targetPlayerId, categoryId, approved);
    });

    // Host override during review
    socket.on('review:host_override', ({ roomCode, targetPlayerId, categoryId, isValid }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = Object.values(room.players).find((p) => p.socketId === socket.id);
      if (player && player.isHost) {
        roomManager.hostOverride(roomCode, targetPlayerId, categoryId, isValid);
      }
    });

    // Finalize review and calculate scores
    socket.on('review:finalize', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = Object.values(room.players).find((p) => p.socketId === socket.id);
      if (player && player.isHost) {
        roomManager.finalizeReview(roomCode, player.id);
      }
    });

    // Transition to next round
    socket.on('game:next_round', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = Object.values(room.players).find((p) => p.socketId === socket.id);
      if (player && player.isHost) {
        roomManager.nextRound(roomCode, player.id);
      }
    });

    // Play again from beginning
    socket.on('game:play_again', ({ roomCode }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = Object.values(room.players).find((p) => p.socketId === socket.id);
      if (player && player.isHost) {
        roomManager.playAgain(roomCode, player.id);
      }
    });

    // Disconnection
    socket.on('disconnect', () => {
      roomManager.handleDisconnect(socket.id);
    });
  });
}
