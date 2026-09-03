import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRoom,
  joinSharedRoom,
  updateSharedSettings,
  setSharedPlayerReady,
} from '@/server/sharedStore';

interface RouteContext {
  params: { code: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const code = (params.code || '').toUpperCase();
  const room = await fetchRoom(code);

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
      const result = await joinSharedRoom(code, player);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (action === 'ready') {
      const result = await setSharedPlayerReady(code, playerId, Boolean(isReady));
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (action === 'update_settings') {
      const result = await updateSharedSettings(code, playerId, settings || {});
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    const room = await fetchRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Otaq tapılmadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Xəta baş verdi.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
