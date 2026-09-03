'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      setNotification({ type: 'warning', message: 'OPERATOR ADINI DAXİL EDİN' });
      return;
    }

    tactileAudio.playStopBuzzer();
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
          message: res.error || 'OTAQ İNİSİALİZASİYA EDİLMƏDİ',
        });
      }
    } catch {
      setIsLoading(false);
      setNotification({ type: 'error', message: 'ŞƏBƏKƏ XƏTASI BAŞ VERDİ' });
    }
  };

  const handleJoinRoom = async () => {
    const trimmedName = name.trim();
    const trimmedCode = joinCode.trim().toUpperCase();

    if (!trimmedName) {
      setNotification({ type: 'warning', message: 'OPERATOR ADINI DAXİL EDİN' });
      return;
    }
    if (!trimmedCode || trimmedCode.length < 4) {
      setNotification({ type: 'warning', message: 'DÜZGÜN 6-XANALI FREKANS KODU DAXİL EDİN' });
      return;
    }

    tactileAudio.playFocusClick();
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
          message: res.error || 'OTAĞA QOŞULMAQ MÜMKÜN OLMADI',
        });
      }
    } catch {
      setIsLoading(false);
      setNotification({ type: 'error', message: 'ŞƏBƏKƏ XƏTASI BAŞ VERDİ' });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] px-3 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Editorial Swiss Top Header Strip */}
        <div className="border border-white/[0.1] bg-[#0E1015] p-6 sm:p-10 mb-6 crosshair-corner">
          <div className="flex items-center gap-3 font-mono text-[10px] tracking-tracked text-zinc-500 mb-3 uppercase">
            <span className="inline-block h-2 w-2 bg-[#D4FF00] shadow-[0_0_6px_#D4FF00]" />
            <span>TERMINAL // MODEL_TE_4.1 // SYSTEM_STANDBY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tighter text-white uppercase leading-[0.95]">
            AD // SOYAD <br />
            <span className="text-[#D4FF00]">ŞƏHƏR // ÖLKƏ</span>
          </h1>

          <p className="mt-4 text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl leading-relaxed">
            Klassik söz kateqoriyası oyununun hardware-inspirasiyalı taktiki multiplayer platforması.
            Split-flap hərf barabanı, modular sintezator kanalları və Bloomberg-səviyyəli real vaxt konsensus matrisi.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-500 pt-4 border-t border-white/[0.06]">
            <span>ENGINE: HYBRID_AUTHORITATIVE</span>
            <span>//</span>
            <span>TELEMETRY: P2P_RADAR</span>
            <span>//</span>
            <span>CHANNELS: 07_DEFAULT</span>
          </div>
        </div>

        {/* Master Control Deck Frame */}
        <div className="border border-white/[0.1] bg-[#0E1015] p-4 sm:p-8 crosshair-corner">
          {/* Hardware Rocker Deck Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#090A0C] border border-white/[0.08] font-mono text-xs">
            <button
              onClick={() => {
                tactileAudio.playKeyStroke();
                setActiveTab('create');
              }}
              className={`py-3 px-4 font-bold tracking-tracked transition cursor-pointer select-none ${
                activeTab === 'create'
                  ? 'bg-[#181B22] text-[#D4FF00] border border-[#D4FF00]/40 shadow-sm'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              [DECK_A: YENİ OTAQ YARAT]
            </button>
            <button
              onClick={() => {
                tactileAudio.playKeyStroke();
                setActiveTab('join');
              }}
              className={`py-3 px-4 font-bold tracking-tracked transition cursor-pointer select-none ${
                activeTab === 'join'
                  ? 'bg-[#181B22] text-[#D4FF00] border border-[#D4FF00]/40 shadow-sm'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              [DECK_B: FREKANSA QOŞUL]
            </button>
          </div>

          {/* Form Channels */}
          <div className="space-y-4">
            {/* Operator Identifier Input Bay */}
            <div className="bg-[#12141A] border border-white/[0.08] p-4 focus-within:border-[#D4FF00] transition-colors">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-tracked text-zinc-500 mb-2">
                <span>INPUT_BAY // OPERATOR_CALLSIGN</span>
                <span>MAX_18_CHAR</span>
              </div>
              <input
                type="text"
                maxLength={18}
                placeholder="MƏS: ANAR, NİGAR, RƏŞAD..."
                value={name}
                onFocus={() => tactileAudio.playFocusClick()}
                onChange={(e) => {
                  tactileAudio.playKeyStroke();
                  setName(e.target.value);
                }}
                className="w-full bg-transparent font-mono text-xl sm:text-2xl font-bold text-white placeholder-zinc-700 focus:outline-none tracking-tight selection:bg-[#FF4800] selection:text-black"
              />
            </div>

            {/* Hardware Pad Avatar Matrix */}
            <div className="bg-[#12141A] border border-white/[0.08] p-4">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-tracked text-zinc-500 mb-3">
                <span>PAD_MATRIX // OPERATOR_ICON</span>
                <span className="text-zinc-300">SELECTED: {avatar}</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                {PLAYER_AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      tactileAudio.playKeyStroke();
                      setAvatar(av);
                    }}
                    className={`h-10 sm:h-11 border text-lg sm:text-xl flex items-center justify-center transition-all hardware-key cursor-pointer ${
                      avatar === av
                        ? 'border-[#D4FF00] bg-[#1E222D] shadow-[0_0_10px_rgba(212,255,0,0.3)]'
                        : 'border-white/[0.06] bg-[#090A0C] hover:border-white/[0.2] hover:bg-[#16181F]'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Room Code Input (If Join Tab) */}
            {activeTab === 'join' && (
              <div className="bg-[#12141A] border border-white/[0.08] p-4 focus-within:border-[#D4FF00] transition-colors">
                <div className="flex items-center justify-between font-mono text-[10px] tracking-tracked text-zinc-500 mb-2">
                  <span>FREQUENCY_CHANNEL // 6X_ALPHA_CODE</span>
                  <span>HEX_SPEC</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="MƏS: AZ8K2P"
                  value={joinCode}
                  onFocus={() => tactileAudio.playFocusClick()}
                  onChange={(e) => {
                    tactileAudio.playKeyStroke();
                    setJoinCode(e.target.value.toUpperCase());
                  }}
                  className="w-full bg-transparent font-mono text-center text-3xl font-extrabold tracking-widest text-[#D4FF00] uppercase placeholder-zinc-700 focus:outline-none"
                />
              </div>
            )}

            {/* Industrial Execution Switch */}
            <div className="pt-2">
              {activeTab === 'create' ? (
                <button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-[#FF4800] hover:bg-[#FF5E1E] text-black font-mono font-black text-sm sm:text-base tracking-tracked uppercase shadow-hard-orange hardware-key cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'İNTİALİZASİYA EDİLİR...' : 'OTAQ YARAT // TRANSMİSSİYANI BAŞLAT'}</span>
                </button>
              ) : (
                <button
                  onClick={handleJoinRoom}
                  disabled={isLoading}
                  className="w-full py-4 px-6 bg-[#D4FF00] hover:bg-[#DCFF33] text-black font-mono font-black text-sm sm:text-base tracking-tracked uppercase shadow-hard-lime hardware-key cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isLoading ? 'QOŞULUR...' : 'FREKANSA QOŞUL // LINK ENGAGE'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Technical Specification Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="border border-white/[0.08] bg-[#0E1015] p-4 crosshair-corner">
            <div className="font-mono text-[9px] tracking-tracked text-[#D4FF00] mb-1">
              SPEC_01 // LATENCY
            </div>
            <h4 className="font-mono font-bold text-white text-xs uppercase">SUB-10MS SYNC</h4>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">
              Authoritative server state və avtonom rehydration arxitekturası.
            </p>
          </div>

          <div className="border border-white/[0.08] bg-[#0E1015] p-4 crosshair-corner">
            <div className="font-mono text-[9px] tracking-tracked text-[#FF4800] mb-1">
              SPEC_02 // SPLIT_FLAP
            </div>
            <h4 className="font-mono font-bold text-white text-xs uppercase">MECHANICAL REEL</h4>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">
              3D solenoid akustik simulyasiyası ilə hərf seçimi barabanı.
            </p>
          </div>

          <div className="border border-white/[0.08] bg-[#0E1015] p-4 crosshair-corner">
            <div className="font-mono text-[9px] tracking-tracked text-[#D4FF00] mb-1">
              SPEC_03 // EMERGENCY
            </div>
            <h4 className="font-mono font-bold text-white text-xs uppercase">TACTILE STOP CUTOFF</h4>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">
              Bütün xanaları dolduran ilk operator 5 saniyəlik möhlət aktivləşdirir.
            </p>
          </div>

          <div className="border border-white/[0.08] bg-[#0E1015] p-4 crosshair-corner">
            <div className="font-mono text-[9px] tracking-tracked text-zinc-400 mb-1">
              SPEC_04 // AUDIT
            </div>
            <h4 className="font-mono font-bold text-white text-xs uppercase">LEDGER CONSENSUS</h4>
            <p className="mt-1 text-[11px] font-mono text-zinc-400">
              Təkrar, unikal və tək cavablar üçün split-diff maliyyə auditi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
