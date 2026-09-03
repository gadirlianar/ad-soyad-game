'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { LobbyView } from '@/components/LobbyView';
import { GameArena } from '@/components/GameArena';
import { ReviewMatrix } from '@/components/ReviewMatrix';
import { PodiumView } from '@/components/PodiumView';
import { PLAYER_AVATARS } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';
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

  const isInitialized = React.useRef(false);
  useEffect(() => {
    if (!isInitialized.current && playerName) {
      setName(playerName);
      if (playerAvatar) setAvatar(playerAvatar);
      isInitialized.current = true;
    }
  }, [playerName, playerAvatar]);

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
      setNotification({ type: 'warning', message: 'Zəhmət olmasa adınızı qeyd edin' });
      return;
    }

    tactileAudio.playKeyStroke();
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
        setNotification({ type: 'success', message: `${res.room.code} otağına qoşuldunuz` });
      } else {
        setNotification({ type: 'error', message: res.error || 'Otağa qoşulmaq mümkün olmadı' });
      }
    } catch {
      setIsJoining(false);
      setNotification({ type: 'error', message: 'Şəbəkə xətası baş verdi' });
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
    <div className="flex-1 flex items-center justify-center px-4 py-8 select-none">
      <div className="w-full max-w-md apple-glass rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <div className="text-center mb-6">
          <span className="text-xs font-semibold text-[#007AFF] uppercase tracking-wider block mb-1">
            Dəvət Olundunuz
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            <span className="text-[#007AFF]">{roomCode}</span> Otağına Qoşulun
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Adınızı və avatarınızı seçib dərhal oyuna başlayın.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] p-3.5 focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
            <label className="block text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-1">
              Adınız
            </label>
            <input
              type="text"
              maxLength={18}
              placeholder="Məs: Anar, Nigar..."
              value={name}
              onFocus={() => tactileAudio.playFocusClick()}
              onChange={(e) => {
                tactileAudio.playKeyStroke();
                setName(e.target.value);
              }}
              className="w-full bg-transparent text-base font-semibold text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] p-3.5">
            <label className="block text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-2">
              Avatar
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
                  className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition cursor-pointer ${
                    avatar === av
                      ? 'bg-black/[0.08] dark:bg-white/[0.15] scale-110 shadow-sm'
                      : 'hover:bg-black/[0.04]'
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
              className="w-full py-3.5 px-6 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold shadow-[0_6px_20px_rgba(0,122,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isJoining ? 'Qoşulur...' : 'Otağa Daxil Ol'}
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Əsas səhifəyə qayıt</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
