import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePendingStore } from '../../store/pendingStore';
import transactionsService from '../../services/transactions.service';
import { syncPendingSpends } from './syncPending';

export function useOnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

// Keeps the offline queue moving: tries when the app opens, when the phone
// comes back online, when you return to the app, and every minute while
// something is waiting. Returns a manual `syncNow` for the "Sync now" button.
export function useOfflineSync() {
  const queryClient = useQueryClient();
  const hasItems = usePendingStore((s) => s.items.some((i) => !i.error));

  const syncNow = useCallback(async () => {
    const store = usePendingStore.getState();
    const result = await syncPendingSpends({
      getItems: () => usePendingStore.getState().items,
      send: (item) =>
        transactionsService.createTransaction(item.monthId, item.potId, item.lineItemId, {
          ...item.payload,
          clientRequestId: item.clientRequestId,
        }),
      onSynced: (item) => store.remove(item.clientRequestId),
      onFailed: (item, message) => store.markFailed(item.clientRequestId, message),
    });

    if (result.synced > 0) {
      queryClient.invalidateQueries({ queryKey: ['month'] });
      queryClient.invalidateQueries({ queryKey: ['spendLog'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    }
    return result;
  }, [queryClient]);

  useEffect(() => {
    if (usePendingStore.getState().items.length > 0) syncNow();

    const onOnline = () => syncNow();
    const onVisible = () => {
      if (document.visibilityState === 'visible' && usePendingStore.getState().items.length > 0) {
        syncNow();
      }
    };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [syncNow]);

  useEffect(() => {
    if (!hasItems) return undefined;
    const timer = setInterval(syncNow, 60_000);
    return () => clearInterval(timer);
  }, [hasItems, syncNow]);

  return { syncNow };
}
