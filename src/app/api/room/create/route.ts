import { NextRequest, NextResponse } from 'next/server';
import { createSharedRoom } from '@/server/sharedStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { player, settings } = body;

    if (!player || !player.name || !player.name.trim()) {
      return NextResponse.json({ success: false, error: 'Oyunçu adı tələb olunur.' }, { status: 400 });
    }

    const room = await createSharedRoom(
      {
        id: player.id || 'p_' + Math.random().toString(36).substring(2, 9),
        name: player.name.trim(),
        avatar: player.avatar || '🦁',
      },
      settings
    );

    return NextResponse.json({ success: true, room });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Otaq yaradılarkən xəta baş verdi.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
