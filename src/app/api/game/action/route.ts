import { NextRequest, NextResponse } from 'next/server';
import {
  getSharedRoom,
  startSharedGame,
  triggerSharedStop,
  roomsStore,
} from '@/server/sharedStore';
import { calculateRoundScores } from '@/lib/gameLogic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, action, playerId, data } = body;

    const code = (roomCode || '').toUpperCase();
    const room = getSharedRoom(code);

    if (!room) {
      return NextResponse.json({ success: false, error: 'Otaq tapılmadı.' }, { status: 404 });
    }

    switch (action) {
      case 'start': {
        const result = startSharedGame(code, playerId);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'answer_update': {
        const { categoryId, value } = data || {};
        if (room.status === 'PLAYING') {
          if (!room.answers[playerId]) room.answers[playerId] = {};
          room.answers[playerId][categoryId] = value;
        }
        return NextResponse.json({ success: true, room });
      }

      case 'submit_answers': {
        const { answers } = data || {};
        if (room.answers) {
          if (!room.answers[playerId]) room.answers[playerId] = {};
          room.answers[playerId] = { ...room.answers[playerId], ...answers };
        }
        return NextResponse.json({ success: true, room });
      }

      case 'stop': {
        const result = triggerSharedStop(code, playerId);
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
        }
        return NextResponse.json({ success: true, room });
      }

      case 'override': {
        const { targetPlayerId, categoryId, isValid } = data || {};
        if (room.status === 'REVIEW' && room.hostId === playerId) {
          const voteKey = `${targetPlayerId}_${categoryId}`;
          if (room.manualOverrides[voteKey] === isValid) {
            delete room.manualOverrides[voteKey];
          } else {
            room.manualOverrides[voteKey] = isValid;
          }
        }
        return NextResponse.json({ success: true, room });
      }

      case 'finalize': {
        if (room.status === 'REVIEW' && room.hostId === playerId) {
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
        }
        return NextResponse.json({ success: true, room });
      }

      case 'next_round': {
        if (room.status === 'SCOREBOARD' && room.hostId === playerId) {
          room.currentRound += 1;
          const result = startSharedGame(code, playerId);
          return NextResponse.json(result);
        }
        return NextResponse.json({ success: true, room });
      }

      case 'play_again': {
        if (room.status === 'FINISHED' && room.hostId === playerId) {
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
