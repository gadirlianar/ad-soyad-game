'use client';

import React, { useState } from 'react';
import {
  Crown,
  Share2,
  Plus,
  Trash2,
  QrCode,
  Check,
  Zap,
} from 'lucide-react';
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
  const allPlayersReady = playersList.every((p) => p.isReady || p.isHost);
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
      setNotification({ type: 'success', message: 'DƏVƏT LİNKİ KOPYALANDI // PAYLAŞIN' });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setNotification({ type: 'info', message: `FREKANS KODU: ${room.code}` });
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
    setNotification({
      type: 'info',
      message: alphabetType === 'az' ? 'ƏLİFBA: AZƏRBAYCAN SEÇİLDİ' : 'ƏLİFBA: ENGLİSH SEÇİLDİ',
    });
  };

  const handleToggleCategory = (cat: Category) => {
    if (!isHost) return;
    tactileAudio.playKeyStroke();
    const currentCats = room.settings.categories;
    const exists = currentCats.some((c) => c.id === cat.id);

    let updated: Category[];
    if (exists) {
      if (currentCats.length <= 3) {
        setNotification({ type: 'warning', message: 'MİNİMUM 3 KANAL AKTİV QALMALIDIR' });
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
    setNotification({ type: 'success', message: `KANAL ƏLAVƏ EDİLDİ: "${label}"` });
  };

  const handleSaveProfile = () => {
    if (!tempName.trim()) return;
    tactileAudio.playKeyStroke();
    setPlayerProfile(tempName.trim(), tempAvatar);
    setIsEditingProfile(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6">
      <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} roomCode={room.code} />

      {/* Top Station Command Strip */}
      <div className="border border-white/[0.1] bg-[#0E1015] p-5 sm:p-6 mb-6 crosshair-corner">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-tracked text-zinc-500 mb-1">
              <span className="inline-block h-1.5 w-1.5 bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]" />
              <span>STATION_CONTROL // FREQUENCY_ROOM: {room.code}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display tracking-tighter text-white uppercase">
              OPERATOR GÖZLƏMƏ STANSİYASI
            </h1>

            <p className="text-[11px] font-mono text-zinc-400 mt-1">
              İştirakçıları dəvət edin, parametrləri tənzimləyin və hazırlıq statusunu kilidləyin.
            </p>
          </div>

          {/* Quick Frequency Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={handleCopyInviteLink}
              className="flex items-center gap-2 border border-white/[0.1] bg-[#12141A] hover:bg-[#181B22] px-3.5 py-2.5 font-mono text-xs text-white tracking-tracked hardware-key cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-[#D4FF00]" />
              <span>{copiedLink ? 'KOPYALANDI' : 'DƏVƏT LİNKİ'}</span>
            </button>

            <button
              onClick={() => {
                tactileAudio.playKeyStroke();
                setIsQrOpen(true);
              }}
              className="flex items-center gap-2 border border-white/[0.1] bg-[#12141A] hover:bg-[#181B22] px-3.5 py-2.5 font-mono text-xs text-white tracking-tracked hardware-key cursor-pointer"
            >
              <QrCode className="h-3.5 w-3.5 text-[#FF4800]" />
              <span>QR_SCAN</span>
            </button>

            {/* Ready Toggle Button */}
            <button
              onClick={handleToggleReady}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs font-bold tracking-tracked border hardware-key cursor-pointer ${
                currentPlayer?.isReady
                  ? 'bg-[#D4FF00] text-black border-[#D4FF00] shadow-hard-lime'
                  : 'bg-[#181B22] text-[#FF4800] border-[#FF4800]/50'
              }`}
            >
              <span className={`h-2 w-2 ${currentPlayer?.isReady ? 'bg-black' : 'bg-[#FF4800]'}`} />
              <span>{currentPlayer?.isReady ? 'READY // LATCHED' : 'HAZIRAM DE'}</span>
            </button>

            {/* Host Start Game Trigger */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="bg-[#FF4800] hover:bg-[#FF5E1E] text-black font-mono font-black text-xs uppercase px-5 py-2.5 tracking-tracked shadow-hard-orange hardware-key cursor-pointer disabled:opacity-40"
              >
                OYUNU BAŞLAT // TRANSMİSSİYA
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Connected Operator Bays */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operator Slot Bays Rack */}
          <div className="border border-white/[0.1] bg-[#0E1015] p-5 crosshair-corner">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold uppercase">OPERATORLAR KONSOLU</span>
                <span className="text-zinc-500">[{playersList.length} AKTİV]</span>
              </div>
              <span className="text-[10px] text-zinc-500 tracking-tracked">CHANNEL: P2P_BROADCAST</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playersList.map((p, idx) => {
                const isMe = p.id === playerId;
                return (
                  <div
                    key={p.id}
                    className={`border p-4 bg-[#12141A] transition flex items-center justify-between ${
                      p.isReady
                        ? 'border-[#D4FF00]/40 shadow-[0_0_8px_rgba(212,255,0,0.08)]'
                        : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center bg-[#090A0C] border border-white/[0.1] text-2xl">
                        {p.avatar}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="font-bold text-white tracking-tight">
                            {p.name}
                          </span>
                          {p.isHost && (
                            <span className="bg-[#FF4800]/20 text-[#FF4800] px-1 text-[8px] font-mono font-bold flex items-center gap-0.5">
                              <Crown className="h-2 w-2" /> HOST
                            </span>
                          )}
                          {isMe && <span className="text-zinc-500 text-[9px]">[YOU]</span>}
                        </div>

                        <span className="font-mono text-[9px] text-zinc-500 tracking-widest mt-0.5">
                          SLOT_0{idx + 1} // LATENCY: {14 + (p.name.length % 5)}MS
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 font-mono text-[10px]">
                      <span
                        className={`font-bold px-2 py-0.5 border ${
                          p.isReady
                            ? 'bg-[#D4FF00]/15 text-[#D4FF00] border-[#D4FF00]/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {p.isReady ? 'READY' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Profile Modification Bay */}
          <div className="border border-white/[0.1] bg-[#0E1015] p-5 crosshair-corner font-mono">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4 text-xs">
              <span className="text-white font-bold uppercase">ÖZ PROFİL PARAMETRLƏRİN</span>
              <button
                onClick={() => {
                  tactileAudio.playKeyStroke();
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="text-[10px] text-[#D4FF00] hover:underline cursor-pointer"
              >
                {isEditingProfile ? '[REVERT_EDITS]' : '[DƏYİŞDİR]'}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-500 tracking-tracked block mb-1">OPERATOR_CALLSIGN:</label>
                  <input
                    type="text"
                    maxLength={18}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-[#12141A] border border-white/[0.1] px-3 py-2 text-white font-bold text-sm focus:border-[#D4FF00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 tracking-tracked block mb-1">OPERATOR_ICON:</label>
                  <div className="grid grid-cols-8 gap-1">
                    {PLAYER_AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => {
                          tactileAudio.playKeyStroke();
                          setTempAvatar(av);
                        }}
                        className={`h-9 border text-lg flex items-center justify-center cursor-pointer ${
                          tempAvatar === av ? 'border-[#D4FF00] bg-[#161922]' : 'border-white/[0.06] bg-[#090A0C]'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="bg-[#D4FF00] text-black font-bold px-4 py-2 text-xs uppercase tracking-tracked cursor-pointer hardware-key mt-2"
                >
                  SAVE PROFILE // COMMIT
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-[#12141A] border border-white/[0.06] p-3">
                <span className="text-2xl">{playerAvatar}</span>
                <div>
                  <span className="text-sm font-bold text-white block">{playerName}</span>
                  <span className="text-[9px] text-zinc-500 tracking-widest">CALLSIGN IDENTIFIER: LATCHED</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Hardware Settings Deck (Host Authority) */}
        <div className="border border-white/[0.1] bg-[#0E1015] p-5 crosshair-corner font-mono space-y-6">
          <div className="border-b border-white/[0.08] pb-3 flex items-center justify-between">
            <span className="text-white font-bold text-xs uppercase">OTAQ TƏNZİMLƏMƏLƏRİ</span>
            <span className="text-[9px] text-zinc-500">{isHost ? 'HOST_AUTHORITY' : 'READ_ONLY'}</span>
          </div>

          {/* Round Duration Rotary Buttons */}
          <div>
            <label className="text-[10px] text-zinc-400 tracking-tracked block mb-2">
              RAUND MÜDDƏTİ:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={!isHost}
                  onClick={() => handleUpdateDuration(opt.value)}
                  className={`py-2 px-1 text-center border text-[11px] font-bold tracking-tight cursor-pointer hardware-key ${
                    room.settings.roundDuration === opt.value
                      ? 'border-[#D4FF00] bg-[#181B22] text-[#D4FF00]'
                      : 'border-white/[0.08] bg-[#12141A] text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.value === 0 ? 'LIMITLESS' : `${opt.value}S`}
                </button>
              ))}
            </div>
          </div>

          {/* Total Rounds Selector */}
          <div>
            <label className="text-[10px] text-zinc-400 tracking-tracked block mb-2">
              RAUND SAYI:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ROUND_OPTIONS.map((r) => (
                <button
                  key={r}
                  disabled={!isHost}
                  onClick={() => handleUpdateRounds(r)}
                  className={`py-2 text-center border text-xs font-bold cursor-pointer hardware-key ${
                    room.settings.totalRounds === r
                      ? 'border-[#D4FF00] bg-[#181B22] text-[#D4FF00]'
                      : 'border-white/[0.08] bg-[#12141A] text-zinc-400 hover:text-white'
                  }`}
                >
                  0{r}
                </button>
              ))}
            </div>
          </div>

          {/* Alphabet Mechanical Toggle */}
          <div>
            <label className="text-[10px] text-zinc-400 tracking-tracked block mb-2">
              ƏLİFBA SİSTEMİ:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={!isHost}
                onClick={() => handleToggleAlphabet('az')}
                className={`py-2 text-center border text-xs font-bold cursor-pointer hardware-key ${
                  room.settings.alphabet.length === AZERBAIJANI_ALPHABET.length
                    ? 'border-[#D4FF00] bg-[#181B22] text-[#D4FF00]'
                    : 'border-white/[0.08] bg-[#12141A] text-zinc-400 hover:text-white'
                }`}
              >
                AZ (30 HƏRF)
              </button>
              <button
                disabled={!isHost}
                onClick={() => handleToggleAlphabet('en')}
                className={`py-2 text-center border text-xs font-bold cursor-pointer hardware-key ${
                  room.settings.alphabet.length === ENGLISH_ALPHABET.length
                    ? 'border-[#D4FF00] bg-[#181B22] text-[#D4FF00]'
                    : 'border-white/[0.08] bg-[#12141A] text-zinc-400 hover:text-white'
                }`}
              >
                EN (26 CHAR)
              </button>
            </div>
          </div>

          {/* Active Categories Channel Grid */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-zinc-400 tracking-tracked mb-2">
              <span>AKTİV KANALLAR ({room.settings.categories.length}):</span>
              <span className="text-zinc-600">MIN 3</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {room.settings.categories.map((c) => (
                <button
                  key={c.id}
                  disabled={!isHost}
                  onClick={() => handleToggleCategory(c)}
                  className="flex items-center gap-1.5 border border-white/[0.1] bg-[#12141A] px-2.5 py-1 text-[11px] text-white hover:border-[#FF4800] hover:text-[#FF4800] transition cursor-pointer"
                  title="Kanalı söndür"
                >
                  <span>{c.azLabel}</span>
                  {isHost && <Trash2 className="h-3 w-3 text-zinc-600 hover:text-[#FF4800]" />}
                </button>
              ))}
            </div>

            {/* Quick Add Custom Category */}
            {isHost && (
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="YENİ KANAL ADI..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
                    className="flex-1 bg-[#12141A] border border-white/[0.1] px-2.5 py-1.5 text-xs text-white focus:border-[#D4FF00] focus:outline-none"
                  />
                  <button
                    onClick={handleAddCustomCategory}
                    className="bg-[#D4FF00] text-black px-3 py-1.5 text-xs font-bold hardware-key cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Suggested Categories */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {SUGGESTED_CUSTOM_CATEGORIES.filter(
                    (s) => !room.settings.categories.some((c) => c.id === s.id)
                  ).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        tactileAudio.playKeyStroke();
                        sendGameAction('update_settings', {
                          settings: { categories: [...room.settings.categories, s] },
                        });
                      }}
                      className="text-[9px] text-zinc-500 border border-white/[0.04] bg-[#090A0C] px-1.5 py-0.5 hover:text-[#D4FF00] hover:border-[#D4FF00]/40"
                    >
                      +{s.azLabel}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
