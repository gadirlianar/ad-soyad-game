'use client';

import React, { useState } from 'react';
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
  Info,
  Layers,
  Hourglass
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { getSocket } from '@/lib/socket';
import {
  DURATION_OPTIONS,
  ROUND_OPTIONS,
  DEFAULT_CATEGORIES,
  SUGGESTED_CUSTOM_CATEGORIES,
  PLAYER_AVATARS
} from '@/lib/constants';
import { Category } from '@/types/game';

export const Lobby: React.FC = () => {
  const { room, playerId, playerName, playerAvatar, setPlayerProfile, setNotification } = useGameStore();
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [tempAvatar, setTempAvatar] = useState(playerAvatar);

  if (!room) return null;

  const currentPlayer = room.players[playerId];
  const isHost = currentPlayer?.isHost;
  const playersList = Object.values(room.players);
  const allPlayersReady = playersList.every((p) => p.isReady || p.isHost);
  const canStartGame = isHost && playersList.length >= 1; // Allows solo testing or multiplayer

  const handleToggleReady = () => {
    if (!currentPlayer) return;
    const nextReady = !currentPlayer.isReady;
    const socket = getSocket();
    socket.emit('player:ready', {
      roomCode: room.code,
      playerId,
      isReady: nextReady,
    });
  };

  const handleStartGame = () => {
    if (!isHost) return;
    const socket = getSocket();
    socket.emit('game:start', { roomCode: room.code });
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
    const socket = getSocket();
    socket.emit('room:update_settings', {
      roomCode: room.code,
      settings: { roundDuration: duration },
    });
  };

  const handleUpdateRounds = (totalRounds: number) => {
    if (!isHost) return;
    const socket = getSocket();
    socket.emit('room:update_settings', {
      roomCode: room.code,
      settings: { totalRounds },
    });
  };

  const handleToggleCategory = (cat: Category) => {
    if (!isHost) return;
    const currentCats = room.settings.categories;
    const exists = currentCats.some((c) => c.id === cat.id);

    let updated: Category[];
    if (exists) {
      if (currentCats.length <= 3) {
        setNotification({ type: 'warning', message: 'Ən azı 3 kateqoriya aktiv olmalıdır!' });
        return;
      }
      updated = currentCats.filter((c) => c.id !== cat.id);
    } else {
      updated = [...currentCats, cat];
    }

    const socket = getSocket();
    socket.emit('room:update_settings', {
      roomCode: room.code,
      settings: { categories: updated },
    });
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

    const socket = getSocket();
    socket.emit('room:update_settings', {
      roomCode: room.code,
      settings: { categories: [...room.settings.categories, newCat] },
    });

    setCustomCategoryInput('');
    setNotification({ type: 'success', message: `"${label}" kateqoriyası əlavə olundu!` });
  };

  const handleSaveProfile = () => {
    if (!tempName.trim()) return;
    setPlayerProfile(tempName.trim(), tempAvatar);
    setIsEditingProfile(false);
    // Re-join with updated profile to broadcast
    const socket = getSocket();
    socket.emit('room:join', {
      roomCode: room.code,
      player: { id: playerId, name: tempName.trim(), avatar: tempAvatar },
    }, () => {});
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Welcome & Invite Header */}
      <div className="glass-panel mb-8 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Oyun Gözləmə Otağı (Lobby)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Dostlarınızı Dəvət Edin
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-md">
              Otaq kodunu və ya dəvət linkini paylaşın. Bütün oyunçular &quot;Hazırdır&quot; etdikdən sonra host oyunu başladacaq.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {/* Room Code Box */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-slate-950/80 px-5 py-3 shadow-inner">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Otaq Kodu</span>
                <p className="font-mono text-2xl font-black tracking-widest text-emerald-400">{room.code}</p>
              </div>
              <button
                onClick={handleCopyInviteLink}
                className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                <span>{copiedLink ? 'Kopyalandı!' : 'Linki Paylaş'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column Grid: Players List & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Players Roster */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-white">Oyunçular ({playersList.length})</h3>
              </div>
              <span className="text-xs text-slate-400">
                {playersList.filter((p) => p.isReady || p.isHost).length} / {playersList.length} Hazır
              </span>
            </div>

            {/* Players Cards */}
            <div className="space-y-3">
              {playersList.map((player) => {
                const isMe = player.id === playerId;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                      isMe
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-white/5 bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-3xl select-none filter drop-shadow">
                        {player.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100">{player.name}</span>
                          {isMe && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                              Sən
                            </span>
                          )}
                          {player.isHost && (
                            <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                              <Crown className="h-3 w-3" /> Host
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {player.isConnected ? 'Bağlantıda' : 'Bağlantı kəsildi...'}
                        </p>
                      </div>
                    </div>

                    {/* Ready status pill */}
                    <div>
                      {player.isHost ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                          <Crown className="h-3.5 w-3.5" />
                          <span>Host</span>
                        </div>
                      ) : player.isReady ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Hazırdır</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Gözləyir</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Profile Customization Button */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5"
              >
                <span>Ad və avatarını dəyiş</span>
              </button>

              {/* Ready button for non-host */}
              {!isHost && (
                <button
                  onClick={handleToggleReady}
                  className={`tactile-btn rounded-xl px-5 py-2.5 text-xs font-bold transition flex items-center gap-2 ${
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
                </button>
              )}
            </div>

            {/* Profile Edit Drawer */}
            {isEditingProfile && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 animate-scale-up">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Adınız:</label>
                <input
                  type="text"
                  maxLength={18}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
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
                          : 'bg-slate-900 border border-white/5 hover:bg-slate-800'
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
              </div>
            )}
          </div>

          {/* Host Start Action Bar */}
          {isHost && (
            <div className="glass-panel-glow rounded-3xl p-6 text-center">
              <div className="mb-4">
                <h4 className="text-base font-bold text-white">Oyunu Başlatmağa Hazırsınız?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {!allPlayersReady
                    ? 'Bütün oyunçular hələ hazır deyil, lakin Host kimi indi də başlada bilərsiniz.'
                    : 'Bütün oyunçular hazırdır! Oyunu başladın.'}
                </p>
              </div>

              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="tactile-btn w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-4 font-black tracking-wide text-slate-950 shadow-xl shadow-emerald-500/25 transition disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                <Play className="h-6 w-6 fill-current" />
                <span>OYUNU BAŞLAT!</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Room Settings & Categories */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center gap-2.5 mb-5 border-b border-white/10 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Oyun Qaydaları və Tənzimləmələri</h3>
                {!isHost && (
                  <span className="text-[11px] text-amber-400 font-medium">
                    (Yalnız Host tənzimləmələri dəyişə bilər)
                  </span>
                )}
              </div>
            </div>

            {/* Round Duration */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                <Hourglass className="h-3.5 w-3.5 text-emerald-400" />
                <span>Raund Müddəti:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={!isHost}
                    onClick={() => handleUpdateDuration(opt.value)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      room.settings.roundDuration === opt.value
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                        : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/10 hover:text-slate-200'
                    } ${!isHost && 'cursor-default'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Rounds */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                <Layers className="h-3.5 w-3.5 text-teal-400" />
                <span>Raundların Sayı:</span>
              </label>
              <div className="flex gap-2">
                {ROUND_OPTIONS.map((num) => (
                  <button
                    key={num}
                    disabled={!isHost}
                    onClick={() => handleUpdateRounds(num)}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition ${
                      room.settings.totalRounds === num
                        ? 'border-teal-500 bg-teal-500/20 text-teal-300'
                        : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/10 hover:text-slate-200'
                    } ${!isHost && 'cursor-default'}`}
                  >
                    {num} Raund
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Customization */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  Aktiv Kateqoriyalar ({room.settings.categories.length}):
                </label>
                <span className="text-[11px] text-slate-500">Tıklayaraq aç/bağla</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isActive = room.settings.categories.some((c) => c.id === cat.id);
                  return (
                    <button
                      key={cat.id}
                      disabled={!isHost}
                      onClick={() => handleToggleCategory(cat)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-white/5 bg-slate-900/40 text-slate-500 line-through'
                      } ${!isHost && 'cursor-default'}`}
                    >
                      {isActive && <Check className="h-3 w-3 text-emerald-400" />}
                      <span>{cat.azLabel}</span>
                    </button>
                  );
                })}

                {/* Show custom categories if any */}
                {room.settings.categories
                  .filter((c) => c.isCustom)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      disabled={!isHost}
                      onClick={() => handleToggleCategory(cat)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/50 bg-purple-500/20 px-3 py-1.5 text-xs font-semibold text-purple-300"
                    >
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <span>{cat.azLabel}</span>
                      {isHost && <Trash2 className="h-3 w-3 ml-1 hover:text-rose-400" />}
                    </button>
                  ))}
              </div>

              {/* Add custom category (Host only) */}
              {isHost && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Xüsusi kateqoriya əlavə et (məs: Peşə, Brend, Film)"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-white transition flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Əlavə et</span>
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
