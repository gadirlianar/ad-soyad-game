'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, QrCode } from 'lucide-react';
import { tactileAudio } from '@/lib/audio';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, roomCode }) => {
  const [copied, setCopied] = React.useState(false);
  const roomUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomCode}`
      : `https://ad-soyad-game.vercel.app/room/${roomCode}`;

  // Laser Kinetic Lime foreground on Basalt background
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    roomUrl
  )}&bgcolor=090a0c&color=d4ff00&margin=12`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      tactileAudio.playKeyStroke();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="relative w-full max-w-sm border border-white/[0.12] bg-[#0E1015] p-6 shadow-2xl crosshair-corner"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                tactileAudio.playKeyStroke();
                onClose();
              }}
              className="absolute right-3 top-3 p-1 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-[10px] tracking-tracked text-[#D4FF00] mb-2 uppercase">
                <QrCode className="h-3.5 w-3.5" />
                <span>OPTICAL_HOOK // MOBILE_SCAN</span>
              </div>

              <h3 className="text-lg font-black font-display text-white uppercase">
                TELEFON KAMERASINI TUTUN
              </h3>
              <p className="mt-1 text-xs text-zinc-400">
                Mobil cihazdan dərhal eyni frekansa qoşulun.
              </p>

              {/* QR Image Box */}
              <div className="my-4 border border-white/[0.1] bg-[#090A0C] p-3 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrApiUrl}
                  alt={`QR code for room ${roomCode}`}
                  className="h-44 w-44"
                />
              </div>

              {/* Room Code Badge & Copy */}
              <div className="w-full flex items-center justify-between border border-white/[0.1] bg-[#12141A] p-2">
                <div className="text-left px-2">
                  <span className="text-[9px] uppercase tracking-tracked text-zinc-500">ROOM_FREQ</span>
                  <p className="font-mono text-base font-black text-[#D4FF00]">{roomCode}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 bg-[#D4FF00] text-black px-3 py-1.5 text-xs font-bold uppercase tracking-tracked hardware-key cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'KOPYALANDI' : 'LİNKİ KOPYALA'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
