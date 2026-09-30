import { useState } from 'react';
import { usePendingStore } from '../../store/pendingStore';
import { useOnlineStatus, useOfflineSync } from './useOfflineSync';
import { formatCurrency } from '../../utils/formatCurrency';
import { useMonth } from '../months/hooks/useMonth';
import { useMonthStore } from '../../store/monthStore';
import styles from './OfflineBanner.module.css';

// Shown at the top of the app when there is no signal, or when spends are
// waiting to sync or were rejected by the server.
export default function OfflineBanner() {
  const online = useOnlineStatus();
  const { syncNow } = useOfflineSync();
  const items = usePendingStore((s) => s.items);
  const { remove, retry } = usePendingStore.getState();
  const { activeMonthId } = useMonthStore();
  const { data: month } = useMonth(activeMonthId);
  const [syncing, setSyncing] = useState(false);

  const waiting = items.filter((i) => !i.error);
  const failed = items.filter((i) => i.error);

  if (online && waiting.length === 0 && failed.length === 0) return null;

  const nameOf = (item) =>
    month?.pots
      ?.find((p) => p._id === item.potId)
      ?.lineItems?.find((li) => li._id === item.lineItemId)?.name ?? 'Spend';

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncNow();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={styles.wrap} role="status">
      {!online && (
        <p className={styles.line}>
          Offline: showing saved data
        </p>
      )}

      {waiting.length > 0 && (
        <div className={styles.row}>
          <span className={styles.line}>
            {waiting.length} spend{waiting.length !== 1 ? 's' : ''} waiting to sync
            
          </span>
          {online && (
            <button className={styles.btn} onClick={handleSync} disabled={syncing} type="button">
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
          )}
        </div>
      )}

      {failed.map((item) => (
        <div key={item.clientRequestId} className={styles.failed}>
          <span className={styles.line}>
            {nameOf(item)} {formatCurrency(item.payload.amount)}: {item.error}
          </span>
          <span className={styles.actions}>
            <button className={styles.btn} onClick={() => retry(item.clientRequestId)} type="button">
              Retry
            </button>
            <button className={styles.btn} onClick={() => remove(item.clientRequestId)} type="button">
              Discard
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
