'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Check, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientStoreInitializer() {
  const { initPlayer, initSyncEngine, notification, setNotification } = useGameStore();

  useEffect(() => {
    initPlayer();
    const cleanup = initSyncEngine();
    return cleanup;
  }, [initPlayer, initSyncEngine]);

  return (
    <>
      {/* Apple Dynamic Island Style Floating Toast */}
      <AnimatePresence>
        {notification && (
          <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none select-none">
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 320 }}
              className="pointer-events-auto apple-glass rounded-full px-4 py-2.5 flex items-center gap-3 shadow-[0_12px_36px_rgba(0,0,0,0.12)] max-w-md border border-black/[0.06] dark:border-white/[0.08]"
            >
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-white ${
                  notification.type === 'error'
                    ? 'bg-[#FF3B30]'
                    : notification.type === 'warning'
                    ? 'bg-[#FF9500]'
                    : notification.type === 'success'
                    ? 'bg-[#34C759]'
                    : 'bg-[#007AFF]'
                }`}
              >
                {notification.type === 'success' && <Check className="h-3 w-3 stroke-[2.5]" />}
                {notification.type === 'error' && <X className="h-3 w-3 stroke-[2.5]" />}
                {notification.type === 'warning' && <AlertTriangle className="h-3 w-3 stroke-[2.5]" />}
                {notification.type === 'info' && <Info className="h-3 w-3 stroke-[2.5]" />}
              </div>

              <span className="text-xs font-medium text-neutral-900 dark:text-white">
                {notification.message}
              </span>

              <button
                onClick={() => setNotification(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition p-0.5 cursor-pointer ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
