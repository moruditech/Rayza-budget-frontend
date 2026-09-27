import { useState } from 'react';
import { useMonthStore } from '../../store/monthStore';
import { useMonth } from '../../features/months/hooks/useMonth';
import { useSpendLog } from '../../features/spendLog/hooks/useSpendLog';
import SpendLogFilters from '../../features/spendLog/components/SpendLogFilters';
import SpendLogTable from '../../components/shared/SpendLogTable/SpendLogTable';
import Button from '../../components/ui/Button/Button';
import styles from './SpendLogPage.module.css';

// ── Loading skeleton ──────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Loading transactions">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className={styles.skeletonRow} />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function SpendLogPage() {
  const { activeMonthId } = useMonthStore();

  // Read the active month's locked status so we can pass it to the table.
  // FR-10 — entries in a locked month cannot be edited or deleted.
  const { data: month } = useMonth(activeMonthId);
  const isLocked = month?.isLocked ?? false;

  // FR-10 — payment method filter (null = All).
  const [paymentMethod, setPaymentMethod] = useState(null);

  const filters = {
    monthId: activeMonthId ?? undefined,
    paymentMethod: paymentMethod ?? undefined,
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSpendLog(filters);

  // Flatten pages into a single list.
  const entries = data?.pages.flatMap((p) => p.entries) ?? [];

  return (
    <>
      {/* FR-10 — payment method filter chips */}
      <SpendLogFilters active={paymentMethod} onChange={setPaymentMethod} />

      {/* Transaction list */}
      {isLoading ? (
        <Skeleton />
      ) : (
        <SpendLogTable
          entries={entries}
          monthId={activeMonthId}
          isLocked={isLocked}
        />
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="sm"
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load more
          </Button>
        </div>
      )}

      {/* Total count when loaded */}
      {!isLoading && data?.pages[0]?.meta && (
        <p className={styles.total}>
          {entries.length} of {data.pages[0].meta.total} transactions
        </p>
      )}
    </>
  );
}
