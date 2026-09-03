'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
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

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    roomUrl
  )}&bgcolor=ffffff&color=000000&margin=12`;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-sm apple-glass rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                tactileAudio.playKeyStroke();
                onClose();
              }}
              className="absolute right-4 top-4 h-7 w-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.08] transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-semibold text-[#007AFF] uppercase tracking-wider block mb-1">
                Kamera ilə Qoşulun
              </span>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                QR Kodu Oxudun
              </h3>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Mobil cihazınızın kamerası ilə dərhal otağa daxil olun.
              </p>

              {/* QR Image Box */}
              <div className="my-5 p-3 rounded-2xl bg-white shadow-sm border border-black/[0.05]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrApiUrl}
                  alt={`QR code for room ${roomCode}`}
                  className="h-44 w-44 rounded-xl"
                />
              </div>

              {/* Room Code Badge & Copy */}
              <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06]">
                <div className="text-left px-1">
                  <span className="text-[10px] text-neutral-400 block">Otaq Kodu</span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">{roomCode}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white px-4 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Kopyalandı' : 'Linki Kopyala'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
