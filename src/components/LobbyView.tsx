'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  CheckCircle2,
  Clock,
  Settings,
  Users,
  Play,
  Share2,
  Plus,
  Trash2,
  Check,
  Sparkles,
  QrCode,
  Sliders,
  Layers,
  Hourglass,
  Wifi,
  ChevronRight
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import {
  DURATION_OPTIONS,
  ROUND_OPTIONS,
  DEFAULT_CATEGORIES,
  SUGGESTED_CUSTOM_CATEGORIES,
  PLAYER_AVATARS,
  AZERBAIJANI_ALPHABET,
  ENGLISH_ALPHABET
} from '@/lib/constants';
import { Category } from '@/types/game';
import { QRCodeModal } from './QRCodeModal';
import { soundManager } from '@/lib/audio';

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
  // Robust Host calculation: true if hostId matches, or flagged as host, or only player in room
  const isHost = Boolean(room.hostId === playerId || currentPlayer?.isHost || playersList.length === 1);
  const allPlayersReady = playersList.every((p) => p.isReady || p.isHost);
  const canStartGame = isHost && playersList.length >= 1;

  const handleToggleReady = () => {
    soundManager.playFocusClick();
    const nextReady = currentPlayer ? !currentPlayer.isReady : true;
    sendGameAction('ready', { playerId, isReady: nextReady });
  };

  const handleStartGame = () => {
    if (!isHost) return;
    sendGameAction('start');
  };

  const handleCopyInviteLink = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.code}` : '';
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setNotification({ type: 'success', message: 'Dəvət linki kopyalandı! Dostlarına göndər.' });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setNotification({ type: 'info', message: `Otaq kodu: ${room.code}` });
    }
  };

  const handleUpdateDuration = (duration: number) => {
    if (!isHost) return;
    sendGameAction('update_settings', { settings: { roundDuration: duration } });
  };

  const handleUpdateRounds = (totalRounds: number) => {
    if (!isHost) return;
    sendGameAction('update_settings', { settings: { totalRounds } });
  };

  const handleToggleAlphabet = (alphabetType: 'az' | 'en') => {
    if (!isHost) return;
    const alphabet = alphabetType === 'az' ? AZERBAIJANI_ALPHABET : ENGLISH_ALPHABET;
    sendGameAction('update_settings', { settings: { alphabet } });
    setNotification({
      type: 'info',
      message: alphabetType === 'az' ? 'Azərbaycan əlifbası seçildi' : 'İngilis əlifbası seçildi',
    });
  };

  const handleToggleCategory = (cat: Category) => {
    if (!isHost) return;
    const currentCats = room.settings.categories;
    const exists = currentCats.some((c) => c.id === cat.id);

    let updated: Category[];
    if (exists) {
      if (currentCats.length <= 3) {
        setNotification({ type: 'warning', message: 'Ən azı 3 kateqoriya aktiv qalmalıdır!' });
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
    setNotification({ type: 'success', message: `"${label}" kateqoriyası əlavə olundu!` });
  };

  const handleSaveProfile = () => {
    if (!tempName.trim()) return;
    setPlayerProfile(tempName.trim(), tempAvatar);
    setIsEditingProfile(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} roomCode={room.code} />

      {/* Hero Command Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/[0.08] bg-[#08080a]/80 p-6 sm:p-8 backdrop-blur-xl mb-8 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Oyun Qərargahı (Lobby)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Oyunçuları Gözləyirik
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-md">
              Kodu paylaşın və ya QR kodu göstərin. Bütün oyunçular hazır olduqda host oyunu başladacaq.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {/* Room Code Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0e0e14] px-4 py-2.5 shadow-inner">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Otaq Kodu</span>
                <p className="font-mono text-xl font-black tracking-widest text-emerald-400">{room.code}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleCopyInviteLink}
                className="flex items-center gap-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] px-3 py-1.5 text-xs font-bold text-slate-200 border border-white/10 transition"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Kopyalandı' : 'Paylaş'}</span>
              </motion.button>

              {/* QR Button */}
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsQrOpen(true)}
                className="flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] p-2 text-slate-200 border border-white/10 transition"
                title="QR Kod göstər"
              >
                <QrCode className="h-4 w-4 text-emerald-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Player Roster & Game Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Player Presence List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0e0e12]/70 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">Qoşulmuş Oyunçular ({playersList.length})</h3>
              </div>
              <span className="text-xs font-medium text-emerald-400">
                {playersList.filter((p) => p.isReady || p.isHost).length} / {playersList.length} Hazır
              </span>
            </div>

            {/* Players Cards */}
            <div className="space-y-3">
              {playersList.map((player) => {
                const isMe = player.id === playerId;
                return (
                  <motion.div
                    key={player.id}
                    layoutId={player.id}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                      isMe
                        ? 'border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/5'
                        : 'border-white/[0.06] bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-3xl select-none filter drop-shadow">{player.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm sm:text-base">{player.name}</span>
                          {isMe && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                              Siz
                            </span>
                          )}
                          {player.isHost && (
                            <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                              <Crown className="h-3 w-3" /> Host
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Wifi className="h-3 w-3 text-emerald-400" /> 24ms
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div>
                      {player.isHost ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20">
                          <Crown className="h-3.5 w-3.5" />
                          <span>Host</span>
                        </div>
                      ) : player.isReady ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Hazırdır</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-xs font-semibold text-slate-400 border border-white/5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Gözləyir</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Profile Edit & Ready Toggle */}
            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center gap-1"
              >
                <span>Ad və avatarı redaktə et</span>
              </button>

              {!isHost && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleReady}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
                    currentPlayer?.isReady
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {currentPlayer?.isReady ? (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Gözləməyə Qayıt</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Hazıram!</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>

            {/* Inline Profile Drawer */}
            <AnimatePresence>
              {isEditingProfile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 rounded-2xl border border-white/10 bg-[#08080a] p-4 overflow-hidden"
                >
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Adınız:</label>
                  <input
                    type="text"
                    maxLength={18}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0e0e14] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />

                  <label className="block text-xs font-medium text-slate-400 mt-3 mb-1.5">Avatar seçin:</label>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {PLAYER_AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => setTempAvatar(av)}
                        className={`h-9 w-9 rounded-lg text-lg flex items-center justify-center transition ${
                          tempAvatar === av
                            ? 'bg-emerald-500/30 border border-emerald-400 scale-110'
                            : 'bg-[#0e0e14] border border-white/5 hover:bg-white/5'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="rounded-lg px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Ləğv et
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="rounded-lg bg-emerald-500 px-4 py-1 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                    >
                      Yadda Saxla
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Host Start Game Trigger */}
          {isHost && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 backdrop-blur-xl text-center">
              <h4 className="text-base font-bold text-white mb-1">Oyunu Başlatmağa Hazırsınız?</h4>
              <p className="text-xs text-slate-400 mb-5">
                {!allPlayersReady
                  ? 'Bəzi oyunçular hələ hazır deyil, lakin Host kimi indi də başlada bilərsiniz.'
                  : 'Bütün heyət hazırdır! Oyunu başladın.'}
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-4 font-black text-slate-950 shadow-2xl shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                <Play className="h-6 w-6 fill-current" />
                <span>OYUNU BAŞLAT!</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Right: Bento Settings & Categories */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0e0e12]/70 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Oyun Tənzimləmələri</h3>
                  {!isHost && (
                    <span className="text-[10px] text-amber-400 font-semibold">(Yalnız Host tənzimləyə bilər)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Timer Modes */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                <Hourglass className="h-3.5 w-3.5 text-emerald-400" />
                <span>Raund Müddəti:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={!isHost}
                    onClick={() => {
                      soundManager.playFocusClick();
                      handleUpdateDuration(opt.value);
                    }}
                    className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition ${
                      room.settings.roundDuration === opt.value
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-white'
                    } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds Count */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                <Layers className="h-3.5 w-3.5 text-teal-400" />
                <span>Raund Sayı:</span>
              </label>
              <div className="flex gap-2">
                {ROUND_OPTIONS.map((num) => (
                  <button
                    key={num}
                    disabled={!isHost}
                    onClick={() => {
                      soundManager.playFocusClick();
                      handleUpdateRounds(num);
                    }}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                      room.settings.totalRounds === num
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300 shadow-md shadow-teal-500/10'
                        : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:text-white'
                    } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {num} Raund
                  </button>
                ))}
              </div>
            </div>

            {/* Alphabet Filters */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-300 mb-2">Əlifba:</label>
              <div className="flex gap-2">
                <button
                  disabled={!isHost}
                  onClick={() => {
                    soundManager.playFocusClick();
                    handleToggleAlphabet('az');
                  }}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition ${
                    room.settings.alphabet.includes('Ə')
                      ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  🇦🇿 Azərbaycan (Ə, Ç, Ş, Ö, Ü...)
                </button>
                <button
                  disabled={!isHost}
                  onClick={() => {
                    soundManager.playFocusClick();
                    handleToggleAlphabet('en');
                  }}
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition ${
                    !room.settings.alphabet.includes('Ə')
                      ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                  } ${!isHost ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  🇬🇧 İngilis (A-Z)
                </button>
              </div>
            </div>

            {/* Categories Bento Box */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Aktiv Kateqoriyalar ({room.settings.categories.length}):
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isActive = room.settings.categories.some((c) => c.id === cat.id);
                  return (
                    <button
                      key={cat.id}
                      disabled={!isHost}
                      onClick={() => {
                        soundManager.playFocusClick();
                        handleToggleCategory(cat);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm'
                          : 'border-white/5 bg-white/[0.02] text-slate-500 line-through opacity-50'
                      } ${!isHost ? 'cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                    >
                      {isActive && <Check className="h-3 w-3 text-emerald-400" />}
                      <span>{cat.azLabel}</span>
                    </button>
                  );
                })}

                {room.settings.categories
                  .filter((c) => c.isCustom)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      disabled={!isHost}
                      onClick={() => {
                        soundManager.playFocusClick();
                        handleToggleCategory(cat);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/50 bg-violet-500/20 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:scale-[1.02] transition"
                    >
                      <span>{cat.azLabel}</span>
                      {isHost && <Trash2 className="h-3 w-3 ml-1 hover:text-rose-400" />}
                    </button>
                  ))}
              </div>

              {/* Suggested Quick-Add Categories */}
              {isHost && (
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                    Tövsiyə olunan əlavə kateqoriyalar:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_CUSTOM_CATEGORIES.map((sug) => {
                      const alreadyAdded = room.settings.categories.some(
                        (c) => c.label.toLowerCase() === sug.label.toLowerCase()
                      );
                      if (alreadyAdded) return null;
                      return (
                        <button
                          key={sug.id}
                          onClick={() => {
                            soundManager.playFocusClick();
                            sendGameAction('update_settings', {
                              settings: { categories: [...room.settings.categories, sug] },
                            });
                            setNotification({
                              type: 'success',
                              message: `"${sug.azLabel}" əlavə olundu!`,
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold text-teal-300 hover:bg-teal-500/20 hover:border-teal-500/50 transition"
                        >
                          <Plus className="h-3 w-3" />
                          <span>{sug.azLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Custom Category */}
              {isHost && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Xüsusi kateqoriya (məs: Brend, Avtomobil)..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                    className="flex-1 rounded-xl border border-white/10 bg-[#08080a] px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    className="rounded-xl bg-white/[0.08] hover:bg-white/[0.15] px-3 py-2 text-xs font-bold text-white transition flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Əlavə</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
