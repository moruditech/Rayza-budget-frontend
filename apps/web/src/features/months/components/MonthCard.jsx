import { useState } from 'react';
import { useCloneMonth } from '../hooks/useMonthMutations';
import LockMonthModal from './LockMonthModal';
import DeleteMonthModal from './DeleteMonthModal';
import { monthLabel } from '../../../utils/formatDate';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './MonthCard.module.css';

// Computes the calendar month that follows year+month (wraps Dec → Jan).
function nextMonth(year, month) {
  return month === 12
    ? { year: year + 1, month: 1 }
    : { year, month: month + 1 };
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
    </svg>
  );
}

export default function MonthCard({ month, isActive, readyToLock = false, onSelect }) {
  const [showLock,    setShowLock]    = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);
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

  const label = monthLabel(month.year, month.month);

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
          <div className={styles.titleWrap}>
            <h3 className={styles.label}>{label}</h3>
            {isActive && <span className={styles.viewing}>Viewing</span>}
          </div>

          <div className={styles.badges}>
            {/* FR-12 — health score chip */}
            {month.healthScore != null && (
              <span className={styles.healthChip}>
                <strong>{month.healthScore}</strong> health
              </span>
            )}
            {readyToLock && !month.isLocked && (
              <span className={styles.readyBadge}>Ready to lock</span>
            )}
            {month.isLocked && (
              <span className={styles.lockedBadge}>Locked</span>
            )}
          </div>
        </div>

        {/* Sub-info */}
        <p className={styles.meta}>
          {formatCurrency(month.totalIncome ?? 0)} income · {month.potCount ?? 0} pot
          {month.potCount !== 1 ? 's' : ''}
        </p>

        {/* Clone / lock error */}
        {cloneError && (
          <p className={styles.errorText}>{cloneError}</p>
        )}

        {/* Actions — stop propagation so the card's onSelect doesn't fire
            when a button is pressed */}
        <div
          className={styles.actions}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {!month.isLocked && (
            <>
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
            </>
          )}

          <button
            className={styles.deleteBtn}
            onClick={() => setShowDelete(true)}
            type="button"
            aria-label={`Delete ${label}`}
          >
            <TrashIcon />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {showLock && (
        <LockMonthModal
          monthId={month._id}
          onClose={() => setShowLock(false)}
        />
      )}

      {showDelete && (
        <DeleteMonthModal
          month={month}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
