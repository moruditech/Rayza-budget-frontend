import { useState } from 'react';
import { useCloneMonth } from '../hooks/useMonthMutations';
import LockMonthModal from './LockMonthModal';
import { monthLabel } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './MonthCard.module.css';

// Computes the calendar month that follows year+month (wraps Dec → Jan).
function nextMonth(year, month) {
  return month === 12
    ? { year: year + 1, month: 1 }
    : { year, month: month + 1 };
}

export default function MonthCard({ month, isActive, onSelect }) {
  const [showLock,    setShowLock]    = useState(false);
  const [cloneError,  setCloneError]  = useState(null);

  const cloneMutation = useCloneMonth();

  const handleClone = () => {
    setCloneError(null);
    const target = nextMonth(month.year, month.month);
    cloneMutation.mutate(
      { id: month._id, ...target },
      {
        onError: (err) => {
          const code = err?.response?.data?.error?.code;
          if (code === 'DUPLICATE') {
            setCloneError(`${monthLabel(target.year, target.month)} already exists.`);
          } else {
            setCloneError('Clone failed. Please try again.');
          }
        },
      }
    );
  };

  return (
    <>
      <div
        className={[styles.card, isActive ? styles.cardActive : ''].join(' ')}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect();
        }}
        aria-pressed={isActive}
      >
        {/* Header row */}
        <div className={styles.header}>
          <h3 className={styles.label}>
            {monthLabel(month.year, month.month)}
          </h3>

          <div className={styles.badges}>
            {/* FR-12 — health score chip */}
            {month.healthScore != null && (
              <span className={styles.healthChip}>
                <strong>{month.healthScore}</strong> health
              </span>
            )}
            {month.isLocked && (
              <span className={styles.lockedBadge}>Locked</span>
            )}
          </div>
        </div>

        {/* Sub-info */}
        <p className={styles.meta}>
          {formatCurrency(month.totalIncome ?? 0)} · {month.potCount ?? 0} pot
          {month.potCount !== 1 ? 's' : ''}
        </p>

        {/* Clone / lock error */}
        {cloneError && (
          <p className={styles.errorText}>{cloneError}</p>
        )}

        {/* Actions — only for unlocked months; stop propagation so the
            card's onSelect doesn't fire when buttons are clicked */}
        {!month.isLocked && (
          <div
            className={styles.actions}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button
              className={styles.actionBtn}
              onClick={handleClone}
              disabled={cloneMutation.isPending}
              type="button"
            >
              {cloneMutation.isPending ? 'Cloning…' : 'Clone'}
            </button>
            <button
              className={[styles.actionBtn, styles.actionBtnLock].join(' ')}
              onClick={() => setShowLock(true)}
              type="button"
            >
              Lock
            </button>
          </div>
        )}
      </div>

      {showLock && (
        <LockMonthModal
          monthId={month._id}
          onClose={() => setShowLock(false)}
        />
      )}
    </>
  );
}
