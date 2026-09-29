import { useState } from 'react';
import { POT_TYPES } from '@budget-app/shared';
import LineItemRow from '../LineItemRow/LineItemRow';
import LineItemForm from '../../../features/lineItems/components/LineItemForm';
import PotForm from '../../../features/pots/components/PotForm';
import Modal from '../../ui/Modal/Modal';
import ConfirmDialog from '../../ui/ConfirmDialog/ConfirmDialog';
import { useDeletePot } from '../../../features/pots/hooks/usePots';
import { formatCurrency } from '../../../utils/formatCurrency';
import { calcPercentage } from '../../../utils/calcPercentage';
import styles from './PotCard.module.css';

// ── Constants ──────────────────────────────────────────────────────────────
const TYPE_COLOR = {
  [POT_TYPES.SPENDING]:   '--warning',
  [POT_TYPES.SAVING]:     '--primary',
  [POT_TYPES.INVESTMENT]: '--gold',
};

const TYPE_LABEL = {
  [POT_TYPES.SPENDING]:   'Spending',
  [POT_TYPES.SAVING]:     'Saving',
  [POT_TYPES.INVESTMENT]: 'Investment',
};

// Returns the progress bar CSS class based on spend vs budget.
// Matches barColor() from the HTML design.
function barClass(pct) {
  if (pct > 100) return styles.barOver;
  if (pct >= 75)  return styles.barWarn;
  return styles.barGood;
}

// ── Chevron icon ───────────────────────────────────────────────────────────
function ChevronIcon({ open }) {
  return (
    <svg
      className={[styles.chevron, open ? styles.chevronOpen : ''].join(' ')}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

// ── PotCard ────────────────────────────────────────────────────────────────
export default function PotCard({ pot, monthId, isLocked }) {
  const [expanded,       setExpanded]       = useState(false);
  const [showLineItem,   setShowLineItem]   = useState(false);
  const [showEditPot,    setShowEditPot]    = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  // Set when the API says the pot has spending history — needs a stronger warning.
  const [hasHistory,     setHasHistory]     = useState(false);

  const deleteMutation = useDeletePot(monthId);

  const spent     = pot.spentAmount     ?? 0;
  const committed = pot.committedAmount ?? 0; // allocated to sinking funds
  const used      = pot.usedAmount      ?? spent + committed;
  const budget    = pot.budgetLimit     ?? 0;
  const remaining = pot.remaining       ?? budget - used;
  const pct       = calcPercentage(used, budget);
  const color  = TYPE_COLOR[pot.type] ?? '--primary';

  // Step 1 — the Delete button only opens the confirmation dialog.
  // Step 2 — confirming tries a normal delete; if the API reports
  // POT_HAS_HISTORY the dialog turns into a stronger warning and the next
  // confirm forces the delete.
  const closeConfirm = () => {
    setConfirmDelete(false);
    setHasHistory(false);
    deleteMutation.reset();
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(
      { id: pot._id, force: hasHistory },
      {
        onSuccess: closeConfirm,
        onError: (err) => {
          const code = err.response?.data?.error?.code;
          if (code === 'POT_HAS_HISTORY') setHasHistory(true);
        },
      }
    );
  };

  return (
    <>
      <div className={styles.potRow}>
        {/* ── Pot header — click to expand/collapse ─────────────────── */}
        <div
          className={styles.potHead}
          onClick={() => setExpanded((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded((v) => !v);
            }
          }}
          aria-expanded={expanded}
        >
          <div className={styles.potName}>
            <span
              className={styles.potDot}
              style={{ background: `var(${color})` }}
            />
            <b className={styles.nameText}>{pot.name}</b>
            <span className={styles.potType}>{TYPE_LABEL[pot.type]}</span>
          </div>

          <div className={styles.potMeta}>
            <div className={styles.potLeftWrap}>
              <span
                className={[styles.potBudget, remaining < 0 ? styles.potBudgetOver : ''].join(' ')}
              >
                {formatCurrency(remaining)}
              </span>
              <span className={styles.potLeftLabel}>left</span>
            </div>
            <ChevronIcon open={expanded} />
          </div>
        </div>

        {/* ── Where the budget went ─────────────────────────────────── */}
        <div
          className={styles.potSummary}
          onClick={() => setExpanded((v) => !v)}
        >
          <span>Budget {formatCurrency(budget)}</span>
          <span>Spent {formatCurrency(spent)}</span>
          {committed > 0 && <span>In funds {formatCurrency(committed)}</span>}
          {(pot.transferredIn ?? 0) > 0 && (
            <span>Received {formatCurrency(pot.transferredIn)}</span>
          )}
          {(pot.transferredOut ?? 0) > 0 && (
            <span>Moved out {formatCurrency(pot.transferredOut)}</span>
          )}
        </div>

        {/* ── Progress bar ──────────────────────────────────────────── */}
        <div
          className={[styles.potProgress, barClass(pct)].join(' ')}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pot.name} — ${Math.round(pct)}% of budget used, ${formatCurrency(remaining)} left`}
        />

        {/* ── Expanded detail ───────────────────────────────────────── */}
        {expanded && (
          <div className={styles.potDetail}>
            {/* Line items */}
            {(pot.lineItems?.length ?? 0) === 0 ? (
              <p className={styles.noItems}>No line items yet.</p>
            ) : (
              pot.lineItems.map((li) => (
                <LineItemRow
                  key={li._id}
                  lineItem={li}
                  pot={pot}
                  monthId={monthId}
                  isLocked={isLocked}
                />
              ))
            )}

            {/* Detail-level actions */}
            {!isLocked && (
              <div className={styles.detailActions}>
                <button
                  className={styles.btnAddLineItem}
                  onClick={(e) => { e.stopPropagation(); setShowLineItem(true); }}
                  type="button"
                >
                  + Add line item
                </button>

                <div className={styles.potActions}>
                  <button
                    className={styles.potActionBtn}
                    onClick={(e) => { e.stopPropagation(); setShowEditPot(true); }}
                    type="button"
                  >
                    Edit
                  </button>

                  <button
                    className={[styles.potActionBtn, styles.danger].join(' ')}
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    disabled={deleteMutation.isPending}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals — rendered outside pot-row so z-index stacks cleanly ── */}
      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${pot.name}?`}
          confirmLabel={hasHistory ? 'Delete anyway' : 'Delete'}
          loading={deleteMutation.isPending}
          error={
            deleteMutation.isError && !hasHistory
              ? 'Could not delete this pot. Please try again.'
              : null
          }
          warning={
            hasHistory
              ? 'This pot has spending history. Deleting it removes that history for good.'
              : null
          }
          onConfirm={handleConfirmDelete}
          onClose={closeConfirm}
        >
          <strong>{pot.name}</strong> and all of its line items will be permanently
          removed from this month. This cannot be undone.
        </ConfirmDialog>
      )}

      {showLineItem && (
        <Modal title="Add line item" onClose={() => setShowLineItem(false)}>
          <LineItemForm
            monthId={monthId}
            potId={pot._id}
            onSuccess={() => setShowLineItem(false)}
          />
        </Modal>
      )}

      {showEditPot && (
        <Modal title="Edit pot" onClose={() => setShowEditPot(false)}>
          <PotForm
            monthId={monthId}
            pot={pot}
            onSuccess={() => setShowEditPot(false)}
          />
        </Modal>
      )}
    </>
  );
}
