import { useState } from 'react';
import { LINE_ITEM_TYPES } from '@budget-app/shared';
import ProgressRing from '../../ui/ProgressRing/ProgressRing';
import MarkUsedModal from '../../../features/lineItems/components/MarkUsedModal';
import LineItemForm from '../../../features/lineItems/components/LineItemForm';
import TransactionForm from '../../../features/transactions/components/TransactionForm';
import Modal from '../../ui/Modal/Modal';
import { useDeleteLineItem } from '../../../features/lineItems/hooks/useLineItems';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './LineItemRow.module.css';

// Maps pot type → CSS custom property for the instant-spend dot colour.
const TYPE_COLOR = {
  SPENDING:   '--warning',
  SAVING:     '--primary',
  INVESTMENT: '--gold',
};

export default function LineItemRow({ lineItem, pot, monthId, isLocked }) {
  const [showMarkUsed,  setShowMarkUsed]  = useState(false);
  const [showEditForm,  setShowEditForm]  = useState(false);
  const [showLogSpend,  setShowLogSpend]  = useState(false);

  const deleteMutation = useDeleteLineItem(monthId, pot._id);
  const isSinking      = lineItem.type === LINE_ITEM_TYPES.SINKING_FUND;
  const dotColor       = TYPE_COLOR[pot.type] ?? '--primary';

  return (
    <>
      <div className={styles.row}>
        {/* Left indicator */}
        {isSinking ? (
          <div className={styles.ringWrap}>
            <ProgressRing
              value={lineItem.accumulatedBalance ?? 0}
              max={lineItem.targetAmount ?? 0}
            />
          </div>
        ) : (
          <span
            className={styles.dot}
            style={{ background: `var(${dotColor})` }}
          />
        )}

        {/* Body */}
        <div className={styles.body}>
          <b className={styles.name}>{lineItem.name}</b>
          {isSinking ? (
            <span className={styles.sub}>
              Saved {formatCurrency(lineItem.accumulatedBalance ?? 0)} of{' '}
              {formatCurrency(lineItem.targetAmount ?? 0)}
            </span>
          ) : (
            <span className={styles.sub}>
              {formatCurrency(lineItem.spentAmount ?? 0)} of{' '}
              {formatCurrency(lineItem.allocatedAmount)} used
            </span>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* FR-06 — Mark as used chip for ready sinking funds */}
          {isSinking && lineItem.isReadyToUse && !isLocked && (
            <button
              className={styles.chipReady}
              onClick={() => setShowMarkUsed(true)}
              type="button"
            >
              Mark as used
            </button>
          )}

          {/* FR-05 — Log spend chip for instant spend line items */}
          {!isSinking && !isLocked && (
            <button
              className={styles.chipLog}
              onClick={() => setShowLogSpend(true)}
              type="button"
            >
              + Log
            </button>
          )}

          {/* Edit / delete — reveal on hover for pointer, always on touch */}
          {!isLocked && (
            <div className={styles.rowBtns}>
              <button
                className={styles.rowBtn}
                onClick={() => setShowEditForm(true)}
                type="button"
                aria-label={`Edit ${lineItem.name}`}
              >
                Edit
              </button>
              <button
                className={[styles.rowBtn, styles.rowBtnDanger].join(' ')}
                onClick={() => deleteMutation.mutate(lineItem._id)}
                disabled={deleteMutation.isPending}
                type="button"
                aria-label={`Delete ${lineItem.name}`}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showMarkUsed && (
        <MarkUsedModal
          lineItem={lineItem}
          potId={pot._id}
          monthId={monthId}
          onClose={() => setShowMarkUsed(false)}
        />
      )}

      {showEditForm && (
        <Modal title="Edit line item" onClose={() => setShowEditForm(false)}>
          <LineItemForm
            monthId={monthId}
            potId={pot._id}
            lineItem={lineItem}
            onSuccess={() => setShowEditForm(false)}
          />
        </Modal>
      )}

      {/* FR-05 — log spend modal */}
      {showLogSpend && (
        <Modal
          title={`Log spend — ${lineItem.name}`}
          onClose={() => setShowLogSpend(false)}
        >
          <TransactionForm
            monthId={monthId}
            potId={pot._id}
            lineItemId={lineItem._id}
            onSuccess={() => setShowLogSpend(false)}
          />
        </Modal>
      )}
    </>
  );
}
