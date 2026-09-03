'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Play,
  LogIn,
  Zap,
  Shield,
  Trophy,
  Flame,
  Gamepad2
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { PLAYER_AVATARS } from '@/lib/constants';

export default function Home() {
  const router = useRouter();
  const {
    playerId,
    playerName,
    playerAvatar,
    setPlayerProfile,
    setNotification,
    createRoomApi,
    joinRoomApi,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [name, setName] = useState(playerName || '');
  const [avatar, setAvatar] = useState(playerAvatar || PLAYER_AVATARS[0]);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (playerName && !name) setName(playerName);
    if (playerAvatar && !avatar) setAvatar(playerAvatar);
  }, [playerName, playerAvatar, name, avatar]);

  const handleCreateRoom = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNotification({ type: 'warning', message: 'Zəhmət olmasa adınızı qeyd edin!' });
      return;
    }

    setIsLoading(true);
    setPlayerProfile(trimmedName, avatar);

    try {
      const res = await createRoomApi({
        id: playerId,
        name: trimmedName,
        avatar,
      });

      setIsLoading(false);

      if (res.success && res.room) {
        router.push(`/room/${res.room.code}`);
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Otaq yaradılarkən xəta baş verdi.',
        });
      }
    } catch {
      setIsLoading(false);
      setNotification({ type: 'error', message: 'Şəbəkə xətası baş verdi.' });
    }
  };

  const handleJoinRoom = async () => {
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

    try {
      const res = await joinRoomApi(trimmedCode, {
        id: playerId,
        name: trimmedName,
        avatar,
      });

      setIsLoading(false);

      if (res.success && res.room) {
        router.push(`/room/${res.room.code}`);
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Otağa qoşulmaq mümkün olmadı.',
        });
      }
    } catch {
      setIsLoading(false);
      setNotification({ type: 'error', message: 'Şəbəkə xətası baş verdi.' });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Mesh Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-400 mb-4 shadow-inner">
            <Sparkles className="h-4 w-4" />
            <span>Klassik Söz Kateqoriyası Oyunu Canlı Formatda</span>
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
        </motion.div>

        {/* Interactive Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto max-w-lg rounded-3xl border border-white/[0.08] bg-[#08080a]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative"
        >
          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-[#0e0e14] p-1.5 mb-6 border border-white/5">
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
                className="w-full rounded-2xl border border-white/10 bg-[#0e0e14] px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Avatar Seçin:
              </label>
              <div className="grid grid-cols-8 gap-2">
                {PLAYER_AVATARS.map((av) => (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                      avatar === av
                        ? 'bg-emerald-500/30 border-2 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20'
                        : 'bg-[#0e0e14] border border-white/5 hover:bg-white/5'
                    }`}
                  >
                    {av}
                  </motion.button>
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
                  className="w-full rounded-2xl border border-white/10 bg-[#0e0e14] px-4 py-3 font-mono text-center text-xl font-bold tracking-widest text-emerald-400 uppercase placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-4">
              {activeTab === 'create' ? (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-4 font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  <Play className="h-5 w-5 fill-current" />
                  <span>{isLoading ? 'Otaq yaradılır...' : 'OTAQ YARAT VƏ BAŞLA'}</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-4 font-black text-slate-950 shadow-xl shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  <LogIn className="h-5 w-5" />
                  <span>{isLoading ? 'Qoşulur...' : 'OTAĞA QOŞUL'}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e12]/70 p-5 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-3">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Canlı Sinxronizasiya</h4>
            <p className="mt-1 text-xs text-slate-400">
              Bütün oyunçular eyni anda 3D rulet hərf seçimi və canlı taymerlə yarışır.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e12]/70 p-5 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 mb-3">
              <Flame className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Taktik &quot;STOP&quot; Düyməsi</h4>
            <p className="mt-1 text-xs text-slate-400">
              Bütün xanaları ilk bitirən STOP basır və digərlərinə 5 saniyə möhlət qalır!
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e12]/70 p-5 backdrop-blur-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 mb-3">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Ağıllı Xallama & Səsvermə</h4>
            <p className="mt-1 text-xs text-slate-400">
              Təkrar cavablar 5 xal, unikal 10 xal, tək cavab isə 15 xal qazandırır.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0e0e12]/70 p-5 backdrop-blur-xl">
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
