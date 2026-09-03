'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Play,
  LogIn,
  Users,
  Shield,
  Zap,
  Trophy,
  Flame,
  ArrowRight,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import { PLAYER_AVATARS } from '@/lib/constants';

export default function Home() {
  const router = useRouter();
  const { playerId, playerName, playerAvatar, setPlayerProfile, setRoom, setNotification } =
    useGameStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState(playerName || '');
  const [avatar, setAvatar] = useState(playerAvatar || PLAYER_AVATARS[0]);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if store updates from localStorage
  React.useEffect(() => {
    if (playerName && !name) setName(playerName);
    if (playerAvatar && !avatar) setAvatar(playerAvatar);
  }, [playerName, playerAvatar, name, avatar]);

  const handleCreateRoom = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNotification({ type: 'warning', message: 'Zəhmət olmasa adınızı qeyd edin!' });
      return;
    }

    setIsLoading(true);
    setPlayerProfile(trimmedName, avatar);

    const socket = getSocket();
    socket.emit(
      'room:create',
      {
        player: { id: playerId, name: trimmedName, avatar },
      },
      (res) => {
        setIsLoading(false);
        if (res.success && res.room) {
          setRoom(res.room);
          router.push(`/room/${res.room.code}`);
        } else {
          setNotification({ type: 'error', message: res.error || 'Otaq yaradılarkən xəta baş verdi.' });
        }
      }
    );
  };

  const handleJoinRoom = () => {
    const trimmedName = name.trim();
    const trimmedCode = joinCode.trim().toUpperCase();

    if (!trimmedName) {
      setNotification({ type: 'warning', message: 'Zəhmət olmasa adınızı qeyd edin!' });
      return;
    }
    if (!trimmedCode || trimmedCode.length < 4) {
      setNotification({ type: 'warning', message: 'Düzgün otaq kodunu daxil edin!' });
      return;
    }

    setIsLoading(true);
    setPlayerProfile(trimmedName, avatar);

    const socket = getSocket();
    socket.emit(
      'room:join',
      {
        roomCode: trimmedCode,
        player: { id: playerId, name: trimmedName, avatar },
      },
      (res) => {
        setIsLoading(false);
        if (res.success && res.room) {
          setRoom(res.room);
          router.push(`/room/${res.room.code}`);
        } else {
          setNotification({ type: 'error', message: res.error || 'Otağa qoşulmaq mümkün olmadı.' });
        }
      }
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Hero Title */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-400 mb-4 shadow-inner">
            <Sparkles className="h-4 w-4" />
            <span>Klassik Söz Kateqoriyası Oyunu Canlı Formatda!</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Ad, Soyad, Şəhər, Ölkə... <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              STOP bas və Qalib Ol!
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Dostlarınızla otaq yaradın, ortaq hərf ilə sözləri tapın, ilk sən STOP basaraq rəqiblərini sıxışdır və xalları topla!
          </p>
        </div>

        {/* Main Action Card */}
        <div className="glass-panel mx-auto max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-slate-900/90 p-1 mb-6 border border-white/5">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Yeni Otaq Yarat</span>
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'join'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Otağa Qoşul</span>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Player Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Adınız / Ləqəbiniz:
              </label>
              <input
                type="text"
                maxLength={18}
                placeholder="Məs: Anar, Nigar, Şahin..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* Avatar Picker */}
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
                    className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      avatar === av
                        ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-900/80 border border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Join Room Code Input (If Join Tab) */}
            {activeTab === 'join' && (
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  6-Rəqəmli Otaq Kodu:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Məs: AZ8K2P"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 font-mono text-center text-xl font-bold tracking-widest text-emerald-400 uppercase placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-4">
              {activeTab === 'create' ? (
                <button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="tactile-btn w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-4 font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:brightness-110 flex items-center justify-center gap-2 text-base"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>{isLoading ? 'Otaq yaradılır...' : 'OTAQ YARAT VƏ BAŞLA'}</span>
                </button>
              ) : (
                <button
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="tactile-btn w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-4 font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition hover:brightness-110 flex items-center justify-center gap-2 text-base"
                >
                  <LogIn className="h-5 w-5" />
                  <span>{isLoading ? 'Qoşulur...' : 'OTAĞA QOŞUL'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-3">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Canlı Sinxronizasiya</h4>
            <p className="mt-1 text-xs text-slate-400">
              Bütün oyunçular eyni anda 3-2-1 geri sayım və canlı taymerlə yarışır.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 mb-3">
              <Flame className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Taktik &quot;STOP&quot; Düyməsi</h4>
            <p className="mt-1 text-xs text-slate-400">
              Bütün xanaları ilk bitirən STOP basır və digərlərinə 5 saniyə möhlət qalır!
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-3">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Ağıllı Xallama & Səsvermə</h4>
            <p className="mt-1 text-xs text-slate-400">
              Təkrar cavablar 5 xal, unikal 10 xal, tək cavab isə 15 xal qazandırır.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-3">
              <Trophy className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Olimpiya Podiumu & Qələbə</h4>
            <p className="mt-1 text-xs text-slate-400">
              Oyun bitdikdə Qızıl, Gümüş, Bürünc kuboklar və konfeti şousu ilə qalib qeyd olunur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
