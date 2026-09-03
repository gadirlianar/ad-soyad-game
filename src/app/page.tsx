'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { PLAYER_AVATARS } from '@/lib/constants';
import { tactileAudio } from '@/lib/audio';

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
      setNotification({ type: 'warning', message: 'Zəhmət olmasa adınızı qeyd edin' });
      return;
    }

    tactileAudio.playKeyStroke();
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
          message: res.error || 'Otaq yaradılarkən xəta baş verdi',
        });
      }
    } catch {
      setIsLoading(false);
      setNotification({ type: 'error', message: 'Şəbəkə xətası baş verdi' });
    }
  };

  const handleJoinRoom = async () => {
    const trimmedName = name.trim();
    const trimmedCode = joinCode.trim().toUpperCase();

    if (!trimmedName) {
      setNotification({ type: 'warning', message: 'Zəhmət olmasa adınızı qeyd edin' });
      return;
    }
    if (!trimmedCode || trimmedCode.length < 4) {
      setNotification({ type: 'warning', message: 'Düzgün 6-rəqəmli otaq kodunu daxil edin' });
      return;
    }

    tactileAudio.playKeyStroke();
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
          message: res.error || 'Otağa qoşulmaq mümkün olmadı',
        });
      }
    } catch {
      setIsLoading(false);
      setNotification({ type: 'error', message: 'Şəbəkə xətası baş verdi' });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 select-none">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Apple Serene Hero Typography */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
            Ad, Soyad
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Dostlarınızla real vaxtda söz kateqoriyası oyunu. Sadə, sürətli və estetik.
          </p>
        </div>

        {/* Cupertino Frosted Control Card */}
        <div className="apple-glass rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          {/* Segmented Control */}
          <div className="flex p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl mb-6 gap-1">
            <button
              onClick={() => {
                tactileAudio.playKeyStroke();
                setActiveTab('create');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Yeni Otaq
            </button>
            <button
              onClick={() => {
                tactileAudio.playKeyStroke();
                setActiveTab('join');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'join'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Koda Qoşul
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-left">
            {/* Name Input Field */}
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

            {/* Avatar Selector */}
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
                    className={`h-9 w-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                      avatar === av
                        ? 'bg-black/[0.08] dark:bg-white/[0.15] scale-110 shadow-sm'
                        : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Code Field (If Join) */}
            {activeTab === 'join' && (
              <div className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] p-3.5 focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                <label className="block text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-1">
                  6-Rəqəmli Otaq Kodu
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Məs: AZ8K2P"
                  value={joinCode}
                  onFocus={() => tactileAudio.playFocusClick()}
                  onChange={(e) => {
                    tactileAudio.playKeyStroke();
                    setJoinCode(e.target.value.toUpperCase());
                  }}
                  className="w-full bg-transparent text-center text-xl font-bold tracking-widest text-[#007AFF] uppercase placeholder-neutral-300 dark:placeholder-neutral-700 focus:outline-none"
                />
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              {activeTab === 'create' ? (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-sm font-semibold shadow-[0_6px_20px_rgba(0,122,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Otaq Hazırlanır...' : 'Otaq Yarat'}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-sm font-semibold shadow-[0_6px_20px_rgba(0,122,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Qoşulur...' : 'Otağa Daxil Ol'}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
