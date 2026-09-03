'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, QrCode, Plus, Trash2, Crown } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import {
  DURATION_OPTIONS,
  ROUND_OPTIONS,
  SUGGESTED_CUSTOM_CATEGORIES,
  PLAYER_AVATARS,
  AZERBAIJANI_ALPHABET,
  ENGLISH_ALPHABET,
} from '@/lib/constants';
import { Category } from '@/types/game';
import { QRCodeModal } from './QRCodeModal';
import { tactileAudio } from '@/lib/audio';

export const LobbyView: React.FC = () => {
  const { room, playerId, playerName, playerAvatar, setPlayerProfile, setNotification, sendGameAction } =
    useGameStore();
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [tempAvatar, setTempAvatar] = useState(playerAvatar);

  if (!room) return null;

  const playersList = Object.values(room.players);
  const currentPlayer = room.players[playerId];
  const isHost = Boolean(room.hostId === playerId || currentPlayer?.isHost || playersList.length === 1);
  const canStartGame = isHost && playersList.length >= 1;

  const handleToggleReady = () => {
    tactileAudio.playKeyStroke();
    const nextReady = currentPlayer ? !currentPlayer.isReady : true;
    sendGameAction('ready', { playerId, isReady: nextReady });
  };

  const handleStartGame = () => {
    if (!isHost) return;
    tactileAudio.playStopBuzzer();
    sendGameAction('start');
  };

  const handleCopyInviteLink = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.code}` : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      tactileAudio.playKeyStroke();
      setNotification({ type: 'success', message: 'Dəvət linki kopyalandı' });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setNotification({ type: 'info', message: `Otaq kodu: ${room.code}` });
    }
  };

  const handleUpdateDuration = (duration: number) => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    sendGameAction('update_settings', { settings: { roundDuration: duration } });
  };

  const handleUpdateRounds = (totalRounds: number) => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    sendGameAction('update_settings', { settings: { totalRounds } });
  };

  const handleToggleAlphabet = (alphabetType: 'az' | 'en') => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    const alphabet = alphabetType === 'az' ? AZERBAIJANI_ALPHABET : ENGLISH_ALPHABET;
    sendGameAction('update_settings', { settings: { alphabet } });
  };

  const handleToggleCategory = (cat: Category) => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    const currentCats = room.settings.categories;
    const exists = currentCats.some((c) => c.id === cat.id);

    let updated: Category[];
    if (exists) {
      if (currentCats.length <= 3) {
        setNotification({ type: 'warning', message: 'Ən azı 3 kateqoriya aktiv qalmalıdır' });
        return;
      }
      updated = currentCats.filter((c) => c.id !== cat.id);
    } else {
      updated = [...currentCats, cat];
    }

    sendGameAction('update_settings', { settings: { categories: updated } });
  };

  const handleAddCustomCategory = () => {
    if (!isHost || !customCategoryInput.trim()) return;
    tactileAudio.playKeyStroke();
    const label = customCategoryInput.trim();
    const id = 'custom_' + Date.now();
    const newCat: Category = {
      id,
      label,
      azLabel: label,
      iconName: 'Tag',
      isCustom: true,
    };

    sendGameAction('update_settings', {
      settings: { categories: [...room.settings.categories, newCat] },
    });

    setCustomCategoryInput('');
  };

  const handleSaveProfile = () => {
    if (!tempName.trim()) return;
    tactileAudio.playKeyStroke();
    const cleanName = tempName.trim();
    setPlayerProfile(cleanName, tempAvatar);
    sendGameAction('update_profile', { name: cleanName, avatar: tempAvatar });
    setIsEditingProfile(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 select-none">
      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} roomCode={room.code} />

      {/* Top Header Card */}
      <div className="apple-glass rounded-3xl p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#34C759]" />
            <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              Otaq: <span className="font-semibold text-neutral-900 dark:text-white">{room.code}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Oyun Gözləmə Otağı
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Dostlarınızı dəvət edin və oyuna başlayın.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyInviteLink}
            className="rounded-full px-4 py-2 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copiedLink ? 'Kopyalandı' : 'Dəvət Et'}</span>
          </button>

          <button
            onClick={() => {
              tactileAudio.playKeyStroke();
              setIsQrOpen(true);
            }}
            className="rounded-full px-4 py-2 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Kod</span>
          </button>

          <button
            onClick={handleToggleReady}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              currentPlayer?.isReady
                ? 'bg-[#34C759] text-white shadow-sm'
                : 'bg-black/[0.04] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {currentPlayer?.isReady ? 'Hazırsınız' : 'Hazıram De'}
          </button>

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStartGame}
              className="rounded-full px-6 py-2 bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(0,122,255,0.3)] transition-all cursor-pointer disabled:opacity-40"
            >
              Oyunu Başlat
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Players List */}
        <div className="md:col-span-2 space-y-6">
          <div className="apple-glass rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                İştirakçılar ({playersList.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playersList.map((p) => {
                const isMe = p.id === playerId;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.03] dark:border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.avatar}</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {p.name}
                          </span>
                          {p.isHost && (
                            <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                              <Crown className="h-3 w-3" />
                            </span>
                          )}
                          {isMe && <span className="text-[10px] text-neutral-400">· Sən</span>}
                        </div>
                        <span className="text-[11px] text-neutral-400">
                          {p.isReady ? 'Hazırdır' : 'Gözləyir'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`h-2 w-2 rounded-full ${
                        p.isReady ? 'bg-[#34C759]' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Edit Card */}
          <div className="apple-glass rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Profiliniz
              </h3>
              <button
                onClick={() => {
                  tactileAudio.playKeyStroke();
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="text-xs font-medium text-[#007AFF] hover:underline cursor-pointer"
              >
                {isEditingProfile ? 'Bağla' : 'Dəyişdir'}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-3">
                <input
                  type="text"
                  maxLength={18}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.08] px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
                <div className="grid grid-cols-8 gap-1.5">
                  {PLAYER_AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        tactileAudio.playKeyStroke();
                        setTempAvatar(av);
                      }}
                      className={`h-8 w-8 rounded-xl text-base flex items-center justify-center transition cursor-pointer ${
                        tempAvatar === av
                          ? 'bg-black/[0.08] dark:bg-white/[0.15]'
                          : 'hover:bg-black/[0.04]'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="rounded-full bg-[#007AFF] text-white text-xs font-semibold px-4 py-2 cursor-pointer shadow-sm"
                >
                  Yadda Saxla
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{playerAvatar}</span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {playerName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Apple Settings Group */}
        <div className="apple-glass rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Oyun Qaydaları
            </h3>
            <span className="text-[11px] text-neutral-400">
              {isHost ? 'Yalnız host dəyişə bilər' : 'Host tərəfindən idarə olunur'}
            </span>
          </div>

          {/* Duration Segmented Control */}
          <div>
            <label className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-2">
              Raund Müddəti
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={!isHost}
                  onClick={() => handleUpdateDuration(opt.value)}
                  className={`py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    room.settings.roundDuration === opt.value
                      ? 'bg-[#007AFF] text-white shadow-sm font-semibold'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds Segmented Control */}
          <div>
            <label className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-2">
              Raund Sayı
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ROUND_OPTIONS.map((r) => (
                <button
                  key={r}
                  disabled={!isHost}
                  onClick={() => handleUpdateRounds(r)}
                  className={`py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    room.settings.totalRounds === r
                      ? 'bg-[#007AFF] text-white shadow-sm font-semibold'
                      : 'bg-black/[0.02] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Alphabet Selector */}
          <div>
            <label className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-2">
              Əlifba
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={!isHost}
                onClick={() => handleToggleAlphabet('az')}
                className={`py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  room.settings.alphabet.length === AZERBAIJANI_ALPHABET.length
                    ? 'bg-[#007AFF] text-white shadow-sm font-semibold'
                    : 'bg-black/[0.02] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Azərbaycan
              </button>
              <button
                disabled={!isHost}
                onClick={() => handleToggleAlphabet('en')}
                className={`py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  room.settings.alphabet.length === ENGLISH_ALPHABET.length
                    ? 'bg-[#007AFF] text-white shadow-sm font-semibold'
                    : 'bg-black/[0.02] dark:bg-white/[0.04] text-neutral-600 dark:text-neutral-400'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-medium text-neutral-400 dark:text-neutral-500 block mb-2">
              Kateqoriyalar ({room.settings.categories.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {room.settings.categories.map((c) => (
                <button
                  key={c.id}
                  disabled={!isHost}
                  onClick={() => handleToggleCategory(c)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/[0.03] dark:bg-white/[0.06] text-neutral-800 dark:text-neutral-200 hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] transition cursor-pointer"
                >
                  <span>{c.azLabel}</span>
                  {isHost && <Trash2 className="h-3 w-3 text-neutral-400" />}
                </button>
              ))}
            </div>

            {/* Quick Add Custom Category */}
            {isHost && (
              <div className="mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Yeni kateqoriya..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                    className="flex-1 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    className="h-8 w-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.08] transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
