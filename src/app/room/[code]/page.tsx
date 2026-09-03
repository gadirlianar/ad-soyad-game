'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { LobbyView } from '@/components/LobbyView';
import { GameArena } from '@/components/GameArena';
import { ReviewMatrix } from '@/components/ReviewMatrix';
import { PodiumView } from '@/components/PodiumView';
import { PLAYER_AVATARS } from '@/lib/constants';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { tactileAudio } from '@/lib/audio';

export default function RoomPage() {
  const params = useParams();
  const roomCode = ((params?.code as string) || '').toUpperCase();

  const {
    room,
    playerId,
    playerName,
    playerAvatar,
    setPlayerProfile,
    setNotification,
    joinRoomApi,
  } = useGameStore();

  const [name, setName] = useState(playerName || '');
  const [avatar, setAvatar] = useState(playerAvatar || PLAYER_AVATARS[0]);
  const [isJoining, setIsJoining] = useState(false);
  const [hasAttemptedAutoJoin, setHasAttemptedAutoJoin] = useState(false);

  useEffect(() => {
    if (playerName && !name) setName(playerName);
    if (playerAvatar && !avatar) setAvatar(playerAvatar);
  }, [playerName, playerAvatar, name, avatar]);

  // Attempt auto-rejoin
  useEffect(() => {
    if (!roomCode || hasAttemptedAutoJoin) return;

    if (playerId && (playerName || name)) {
      joinRoomApi(roomCode, {
        id: playerId,
        name: playerName || name,
        avatar: playerAvatar || avatar,
      }).then(() => {
        setHasAttemptedAutoJoin(true);
      });
    } else {
      setHasAttemptedAutoJoin(true);
    }
  }, [roomCode, playerId, playerName, playerAvatar, name, avatar, hasAttemptedAutoJoin, joinRoomApi]);

  const handleManualJoin = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNotification({ type: 'warning', message: 'OPERATOR ADINI DAXİL EDİN' });
      return;
    }

    tactileAudio.playStopBuzzer();
    setIsJoining(true);
    setPlayerProfile(trimmedName, avatar);

    try {
      const res = await joinRoomApi(roomCode, {
        id: playerId,
        name: trimmedName,
        avatar,
      });

      setIsJoining(false);
      if (res.success && res.room) {
        setNotification({ type: 'success', message: `${res.room.code} FREKANSINA QOŞULDUNUZ` });
      } else {
        setNotification({ type: 'error', message: res.error || 'OTAĞA QOŞULMAQ MÜMKÜN OLMADI' });
      }
    } catch {
      setIsJoining(false);
      setNotification({ type: 'error', message: 'ŞƏBƏKƏ XƏTASI BAŞ VERDİ' });
    }
  };

  // If in room and room code matches:
  if (room && room.code === roomCode) {
    switch (room.status) {
      case 'LOBBY':
        return <LobbyView />;
      case 'COUNTDOWN':
      case 'PLAYING':
        return <GameArena />;
      case 'REVIEW':
        return <ReviewMatrix />;
      case 'SCOREBOARD':
      case 'FINISHED':
        return <PodiumView />;
      default:
        return <LobbyView />;
    }
  }

  // Fast Join card with pre-filled room code
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-8 font-mono">
      <div className="w-full max-w-md border border-white/[0.1] bg-[#0E1015] p-6 sm:p-8 crosshair-corner">
        <div className="border-b border-white/[0.08] pb-4 mb-6">
          <div className="flex items-center gap-2 text-[10px] tracking-tracked text-[#D4FF00] mb-1">
            <span className="inline-block h-1.5 w-1.5 bg-[#D4FF00]" />
            <span>CHANNEL_INVITATION // P2P_HOOK</span>
          </div>
          <h2 className="text-2xl font-black font-display text-white uppercase">
            <span className="text-[#D4FF00] font-mono">{roomCode}</span> KANALINA QOŞULUN
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Operator adınızı və ikonunuzu seçib transmissiyaya qoşulun.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#12141A] border border-white/[0.08] p-3">
            <label className="block text-[10px] tracking-tracked text-zinc-500 mb-1">
              OPERATOR CALLSIGN:
            </label>
            <input
              type="text"
              maxLength={18}
              placeholder="MƏS: ANAR, NİGAR..."
              value={name}
              onFocus={() => tactileAudio.playFocusClick()}
              onChange={(e) => {
                tactileAudio.playKeyStroke();
                setName(e.target.value);
              }}
              className="w-full bg-transparent font-mono text-base font-bold text-white placeholder-zinc-700 focus:outline-none"
            />
          </div>

          <div className="bg-[#12141A] border border-white/[0.08] p-3">
            <label className="block text-[10px] tracking-tracked text-zinc-500 mb-2">
              OPERATOR ICON:
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {PLAYER_AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    tactileAudio.playKeyStroke();
                    setAvatar(av);
                  }}
                  className={`h-9 border text-base flex items-center justify-center transition hardware-key cursor-pointer ${
                    avatar === av
                      ? 'border-[#D4FF00] bg-[#181B22]'
                      : 'border-white/[0.06] bg-[#090A0C]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleManualJoin}
              disabled={isJoining}
              className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#DCFF33] text-black font-mono font-bold text-xs uppercase tracking-tracked shadow-hard-lime hardware-key cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span>{isJoining ? 'QOŞULUR...' : 'KANALA DAXİL OL // CONNECT'}</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>ƏSAS KONSOLA QAYIT</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
