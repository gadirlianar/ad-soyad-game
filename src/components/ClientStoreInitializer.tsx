'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function ClientStoreInitializer() {
  const { initPlayer, initSyncEngine, notification, setNotification } = useGameStore();

  useEffect(() => {
    initPlayer();
    const cleanup = initSyncEngine();
    return cleanup;
  }, [initPlayer, initSyncEngine]);

  return (
    <>
      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-scale-up">
          <div
            className={`flex items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              notification.type === 'error'
                ? 'border-rose-500/50 bg-rose-950/90 text-rose-200'
                : notification.type === 'warning'
                ? 'border-amber-500/50 bg-amber-950/90 text-amber-200'
                : notification.type === 'success'
                ? 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200'
                : 'border-blue-500/50 bg-slate-900/90 text-slate-200'
            }`}
          >
            {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />}
            {notification.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />}
            {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />}
            {notification.type === 'info' && <Info className="h-5 w-5 text-cyan-400 shrink-0" />}

            <p className="text-xs font-semibold">{notification.message}</p>

            <button
              onClick={() => setNotification(null)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
