import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRoom,
  saveRoom,
  startSharedGame,
  triggerSharedStop,
  updateSharedSettings,
  setSharedPlayerReady,
} from '@/server/sharedStore';
import { calculateRoundScores } from '@/lib/gameLogic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, action, playerId, data } = body;

    const code = (roomCode || '').toUpperCase();
    const room = await fetchRoom(code);

    if (!room) {
      return NextResponse.json({ success: false, error: 'Otaq tapılmadı.' }, { status: 404 });
    }

    switch (action) {
      case 'update_settings': {
        const settings = data?.settings || body.settings || {};
        const result = await updateSharedSettings(code, playerId, settings);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'ready': {
        const isReady = data?.isReady !== undefined ? data.isReady : body.isReady;
        const result = await setSharedPlayerReady(code, playerId, Boolean(isReady));
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'start': {
        const result = await startSharedGame(code, playerId);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'answer_update': {
        const { categoryId, value } = data || {};
        if (room.status === 'PLAYING') {
          if (!room.answers[playerId]) room.answers[playerId] = {};
          room.answers[playerId][categoryId] = value;
          await saveRoom(room);
        }
        return NextResponse.json({ success: true, room });
      }

      case 'submit_answers': {
        const { answers } = data || {};
        if (room.answers) {
          if (!room.answers[playerId]) room.answers[playerId] = {};
          room.answers[playerId] = { ...room.answers[playerId], ...answers };
          await saveRoom(room);
        }
        return NextResponse.json({ success: true, room });
      }

      case 'stop': {
        const result = await triggerSharedStop(code, playerId);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'vote': {
        const { voterId, targetPlayerId, categoryId, approved } = data || {};
        if (room.status === 'REVIEW' && voterId !== targetPlayerId) {
          const voteKey = `${targetPlayerId}_${categoryId}`;
          if (!room.votes[voteKey]) room.votes[voteKey] = {};
          if (room.votes[voteKey][voterId] === approved) {
            delete room.votes[voteKey][voterId];
          } else {
            room.votes[voteKey][voterId] = approved;
          }
          await saveRoom(room);
        }
        return NextResponse.json({ success: true, room });
      }

      case 'override': {
        const { targetPlayerId, categoryId, isValid } = data || {};
        const isHost = room.hostId === playerId || room.players[playerId]?.isHost;
        if (room.status === 'REVIEW' && isHost) {
          const voteKey = `${targetPlayerId}_${categoryId}`;
          if (room.manualOverrides[voteKey] === isValid) {
            delete room.manualOverrides[voteKey];
          } else {
            room.manualOverrides[voteKey] = isValid;
          }
          await saveRoom(room);
        }
        return NextResponse.json({ success: true, room });
      }

      case 'finalize': {
        const isHost = room.hostId === playerId || room.players[playerId]?.isHost;
        if (room.status === 'REVIEW' && isHost) {
          const roundResult = calculateRoundScores(room);
          room.roundResults.push(roundResult);

          for (const [pId, pts] of Object.entries(roundResult.roundTotals)) {
            if (room.players[pId]) {
              room.players[pId].score += pts;
              room.players[pId].roundScores[room.currentRound] = pts;
            }
          }

          if (room.currentRound >= room.settings.totalRounds) {
            room.status = 'FINISHED';
          } else {
            room.status = 'SCOREBOARD';
          }
          await saveRoom(room);
        }
        return NextResponse.json({ success: true, room });
      }

      case 'next_round': {
        const isHost = room.hostId === playerId || room.players[playerId]?.isHost;
        if (room.status === 'SCOREBOARD' && isHost) {
          room.currentRound += 1;
          const result = await startSharedGame(code, playerId);
          return NextResponse.json(result);
        }
        return NextResponse.json({ success: true, room });
      }

      case 'play_again': {
        const isHost = room.hostId === playerId || room.players[playerId]?.isHost;
        if (room.status === 'FINISHED' && isHost) {
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

          for (const p of Object.values(room.players)) {
            p.score = 0;
            p.roundScores = {};
            p.isReady = p.isHost;
            p.isSpectator = false;
          }
          await saveRoom(room);
        }
        return NextResponse.json({ success: true, room });
      }

      default:
        return NextResponse.json({ success: false, error: 'Naməlum əməliyyat.' }, { status: 400 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Xəta baş verdi.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
