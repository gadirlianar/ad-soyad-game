'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import { Lobby } from '@/components/Lobby';
import { GameArena } from '@/components/GameArena';
import { ReviewTable } from '@/components/ReviewTable';
import { Scoreboard } from '@/components/Scoreboard';
import { PLAYER_AVATARS } from '@/lib/constants';
import { AlertCircle, ArrowLeft, LogIn, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = ((params?.code as string) || '').toUpperCase();

  const { room, playerId, playerName, playerAvatar, setPlayerProfile, setRoom, setNotification } =
    useGameStore();

  const [name, setName] = useState(playerName || '');
  const [avatar, setAvatar] = useState(playerAvatar || PLAYER_AVATARS[0]);
  const [isJoining, setIsJoining] = useState(false);
  const [hasAttemptedAutoJoin, setHasAttemptedAutoJoin] = useState(false);

  // Sync state if store updates from localStorage
  useEffect(() => {
    if (playerName && !name) setName(playerName);
    if (playerAvatar && !avatar) setAvatar(playerAvatar);
  }, [playerName, playerAvatar, name, avatar]);

  // Attempt auto-rejoin if player identity and room code match
  useEffect(() => {
    if (!roomCode || hasAttemptedAutoJoin) return;

    if (playerId && (playerName || name)) {
      const socket = getSocket();
      socket.emit(
        'room:join',
        {
          roomCode,
          player: { id: playerId, name: playerName || name, avatar: playerAvatar || avatar },
        },
        (res) => {
          setHasAttemptedAutoJoin(true);
          if (res.success && res.room) {
            setRoom(res.room);
          }
        }
      );
    } else {
      setHasAttemptedAutoJoin(true);
    }
  }, [roomCode, playerId, playerName, playerAvatar, name, avatar, hasAttemptedAutoJoin, setRoom]);

  const handleManualJoin = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNotification({ type: 'warning', message: 'Zəhmət olmasa adınızı daxil edin!' });
      return;
    }

    setIsJoining(true);
    setPlayerProfile(trimmedName, avatar);

    const socket = getSocket();
    socket.emit(
      'room:join',
      {
        roomCode,
        player: { id: playerId, name: trimmedName, avatar },
      },
      (res) => {
        setIsJoining(false);
        if (res.success && res.room) {
          setRoom(res.room);
          setNotification({ type: 'success', message: `${res.room.code} otağına qoşuldunuz!` });
        } else {
          setNotification({ type: 'error', message: res.error || 'Otağa qoşulmaq mümkün olmadı.' });
        }
      }
    );
  };

  // If in room and room code matches:
  if (room && room.code === roomCode) {
    switch (room.status) {
      case 'LOBBY':
        return <Lobby />;
      case 'COUNTDOWN':
      case 'PLAYING':
        return <GameArena />;
      case 'REVIEW':
        return <ReviewTable />;
      case 'SCOREBOARD':
      case 'FINISHED':
        return <Scoreboard />;
      default:
        return <Lobby />;
    }
  }

  // If not joined yet, show friendly Join card with prefilled Room Code
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Dəvət Olundunuz!</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            <span className="font-mono text-emerald-400">{roomCode}</span> Otağına Qoşulun
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Adınızı və avatarınızı seçib dərhal oyuna başlayın.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Adınız / Ləqəbiniz:
            </label>
            <input
              type="text"
              maxLength={18}
              placeholder="Məs: Anar, Nigar..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Avatar Seçin:
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PLAYER_AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition ${
                    avatar === av
                      ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-110 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900/80 border border-white/5 hover:bg-slate-800'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={handleManualJoin}
              disabled={isJoining}
              className="tactile-btn w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-3.5 font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:brightness-110 flex items-center justify-center gap-2 text-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>{isJoining ? 'Qoşulur...' : 'OTAĞA DAXİL OL'}</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Əsas səhifəyə qayıt</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
