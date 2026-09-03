import { NextRequest, NextResponse } from 'next/server';
import { getSharedRoom, joinSharedRoom, roomsStore } from '@/server/sharedStore';

interface RouteContext {
  params: { code: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const code = (params.code || '').toUpperCase();
  const room = getSharedRoom(code);

  if (!room) {
    return NextResponse.json({ success: false, error: 'Otaq tapılmadı.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const code = (params.code || '').toUpperCase();
  try {
    const body = await req.json();
    const { action, player, settings, isReady, playerId } = body;

    if (action === 'join') {
      const result = joinSharedRoom(code, player);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const room = getSharedRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Otaq tapılmadı.' }, { status: 404 });
    }

    if (action === 'ready') {
      if (room.players[playerId]) {
        room.players[playerId].isReady = isReady;
      }
      return NextResponse.json({ success: true, room });
    }

    if (action === 'update_settings') {
      if (room.status === 'LOBBY' && room.hostId === playerId) {
        room.settings = { ...room.settings, ...settings };
        room.roundTimeRemaining = room.settings.roundDuration;
      }
      return NextResponse.json({ success: true, room });
    }

    return NextResponse.json({ success: true, room });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Xəta baş verdi.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
