import { useState } from 'react';
import { POT_TYPES } from '@budget-app/shared';
import LineItemRow from '../LineItemRow/LineItemRow';
import LineItemForm from '../../../features/lineItems/components/LineItemForm';
import PotForm from '../../../features/pots/components/PotForm';
import Modal from '../../ui/Modal/Modal';
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

  const deleteMutation = useDeletePot(monthId);

  const spent  = pot.spentAmount  ?? 0;
  const budget = pot.budgetLimit  ?? 0;
  const pct    = calcPercentage(spent, budget);
  const color  = TYPE_COLOR[pot.type] ?? '--primary';

  // First attempt — no force. If the API returns POT_HAS_HISTORY, we
  // surface a confirmation inside the card before trying again with force.
  const handleDelete = () => {
    deleteMutation.mutate(
      { id: pot._id, force: false },
      {
        onError: (err) => {
          const code = err.response?.data?.error?.code;
          if (code === 'POT_HAS_HISTORY') setConfirmDelete(true);
        },
      }
    );
  };

  const handleForceDelete = () => {
    deleteMutation.mutate({ id: pot._id, force: true });
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
            <span className={styles.potBudget}>{formatCurrency(budget)}</span>
            <ChevronIcon open={expanded} />
          </div>
        </div>

        {/* ── Progress bar ──────────────────────────────────────────── */}
        <div
          className={[styles.potProgress, barClass(pct)].join(' ')}
          style={{ width: `${Math.min(pct, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pot.name} — ${Math.round(pct)}% of budget used`}
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

                  {confirmDelete ? (
                    <span className={styles.deleteConfirm}>
                      Has history.{' '}
                      <button
                        className={[styles.potActionBtn, styles.danger].join(' ')}
                        onClick={handleForceDelete}
                        disabled={deleteMutation.isPending}
                        type="button"
                      >
                        Delete anyway
                      </button>
                      {' '}
                      <button
                        className={styles.potActionBtn}
                        onClick={() => setConfirmDelete(false)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      className={[styles.potActionBtn, styles.danger].join(' ')}
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      disabled={deleteMutation.isPending}
                      type="button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals — rendered outside pot-row so z-index stacks cleanly ── */}
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
