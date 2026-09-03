'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { AlertTriangle, Check, Info, X } from 'lucide-react';

export default function ClientStoreInitializer() {
  const { initPlayer, initSyncEngine, notification, setNotification } = useGameStore();

  useEffect(() => {
    initPlayer();
    const cleanup = initSyncEngine();
    return cleanup;
  }, [initPlayer, initSyncEngine]);

  return (
    <>
      {/* Global Neo-Industrial Telemetry Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 max-w-sm font-mono text-xs">
          <div
            className={`flex items-center gap-3 border p-3.5 shadow-2xl bg-[#0E1015] crosshair-corner ${
              notification.type === 'error'
                ? 'border-[#FF4800] text-white shadow-[0_0_15px_rgba(255,72,0,0.25)]'
                : notification.type === 'warning'
                ? 'border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : notification.type === 'success'
                ? 'border-[#D4FF00] text-white shadow-[0_0_15px_rgba(212,255,0,0.25)]'
                : 'border-white/[0.2] text-white'
            }`}
          >
            {notification.type === 'error' && (
              <span className="h-2 w-2 bg-[#FF4800] shrink-0 shadow-[0_0_6px_#FF4800]" />
            )}
            {notification.type === 'warning' && (
              <span className="h-2 w-2 bg-amber-400 shrink-0 shadow-[0_0_6px_#F59E0B]" />
            )}
            {notification.type === 'success' && (
              <span className="h-2 w-2 bg-[#D4FF00] shrink-0 shadow-[0_0_6px_#D4FF00]" />
            )}
            {notification.type === 'info' && (
              <span className="h-2 w-2 bg-white shrink-0" />
            )}

            <div className="flex-1">
              <span className="text-[9px] tracking-tracked text-zinc-500 block uppercase mb-0.5">
                SIGNAL_DISPATCH // {notification.type.toUpperCase()}
              </span>
              <p className="font-bold text-xs uppercase tracking-tight">{notification.message}</p>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="text-zinc-500 hover:text-white p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
