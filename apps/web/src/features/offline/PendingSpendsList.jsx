import { usePendingStore } from '../../store/pendingStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { shortDate } from '../../utils/formatDate';
import styles from './OfflineBanner.module.css';

// Spends saved on this phone that are not on the server yet, shown at the top
// of Activity so they do not look lost.
export default function PendingSpendsList({ month }) {
  const items = usePendingStore((s) => s.items).filter((i) => i.monthId === month?._id);
  if (items.length === 0) return null;

  return (
    <div className={styles.wrap} aria-label="Spends waiting to sync">
      {items.map((item) => {
        const pot = month.pots?.find((p) => p._id === item.potId);
        const name = pot?.lineItems?.find((li) => li._id === item.lineItemId)?.name ?? 'Spend';
        return (
          <div key={item.clientRequestId} className={styles.row}>
            <span className={styles.line}>
              {name}
              {pot ? ` · ${pot.name}` : ''} · {shortDate(item.payload.date)}
            </span>
            <span className={styles.line}>
              −{formatCurrency(item.payload.amount)}{' '}
              <em>{item.error ? '(not synced)' : '(waiting to sync)'}</em>
            </span>
          </div>
        );
      })}
    </div>
  );
}
