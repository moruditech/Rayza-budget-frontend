import { useState } from 'react';
import ConfirmDialog from '../../ui/ConfirmDialog/ConfirmDialog';
import { useDeleteTransaction } from '../../../features/transactions/hooks/useTransactions';
import TransactionForm from '../../../features/transactions/components/TransactionForm';
import Modal from '../../ui/Modal/Modal';
import { formatCurrency } from '../../../utils/formatCurrency';
import { shortDate } from '../../../utils/formatDate';
import { describeFundEntry } from '../../../utils/fundActivityText';
import styles from './SpendLogTable.module.css';

// Maps pot type → CSS custom property for the icon circle colour.
// Defensive — falls back to --primary if type is absent.
const TYPE_COLOR = {
  SPENDING:   '--warning',
  SAVING:     '--primary',
  INVESTMENT: '--gold',
};

// Human-readable payment method labels.
const PM_LABEL = {
  CASH:  'Cash',
  CARD:  'Card',
  EFT:   'EFT',
  OTHER: 'Other',
};

// Non-spend entries (fund withdrawals and transfers) get a small label and
// can't be edited as transactions.
const TYPE_LABEL = {
  SINKING_FUND_USED: 'Withdrawal',
  SINKING_FUND_DEPOSIT: 'Added to fund',
  TRANSFER_OUT:      'Transfer out',
  TRANSFER_IN:       'Transfer in',
};

// ── Single transaction row ─────────────────────────────────────────────────
function TxnRow({ entry, monthId, isLocked }) {
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const potId      = entry.pot?._id;
  const lineItemId = entry.lineItem?._id;

  const deleteMutation = useDeleteTransaction(monthId, potId, lineItemId);
  const iconColor = `var(${TYPE_COLOR[entry.pot?.type] ?? '--primary'})`;
  const isSpend   = !entry.type || entry.type === 'INSTANT_SPEND';
  const isIncoming = entry.type === 'TRANSFER_IN' || entry.type === 'SINKING_FUND_DEPOSIT';

  return (
    <>
      <div className={styles.txnRow}>
        {/* Coloured circle — matches .txn-icon */}
        <div
          className={styles.txnIcon}
          style={{ background: iconColor }}
          aria-hidden="true"
        />

        {/* Body — line item name + pot · date */}
        <div className={styles.txnBody}>
          <b className={styles.txnName}>{entry.lineItem?.name}</b>
          <span className={styles.txnMeta}>
            {TYPE_LABEL[entry.type] ? `${TYPE_LABEL[entry.type]} · ` : ''}
            {entry.pot?.name}
            {entry.date ? ` · ${shortDate(entry.date)}` : ''}
          </span>
          {!isSpend && (
            <span className={styles.txnNote}>{describeFundEntry(entry)}</span>
          )}
          {isSpend && entry.note && (
            <span className={styles.txnNote}>{entry.note}</span>
          )}
        </div>

        {/* Right — amount + payment method badge + actions */}
        <div className={styles.txnRight}>
          <b className={styles.txnAmount}>
            {isIncoming ? '+' : '−'}{formatCurrency(entry.amount)}
          </b>
          {isSpend && (
            <span className={styles.txnPm}>
              {PM_LABEL[entry.paymentMethod] ?? entry.paymentMethod}
            </span>
          )}

          {/* Edit / delete — hidden until hover on pointer devices,
              always visible on touch devices (see CSS media query) */}
          {!isLocked && isSpend && (
            <div className={styles.txnActions}>
              <button
                className={styles.txnBtn}
                onClick={() => setShowEdit(true)}
                type="button"
                aria-label="Edit transaction"
              >
                Edit
              </button>
              <button
                className={[styles.txnBtn, styles.txnBtnDanger].join(' ')}
                onClick={() => setConfirmDelete(true)}
                disabled={deleteMutation.isPending}
                type="button"
                aria-label="Delete transaction"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this transaction?"
          loading={deleteMutation.isPending}
          error={
            deleteMutation.isError ? 'Could not delete the transaction. Please try again.' : null
          }
          onConfirm={() =>
            deleteMutation.mutate(entry._id, { onSuccess: () => setConfirmDelete(false) })
          }
          onClose={() => setConfirmDelete(false)}
        >
          <strong>{formatCurrency(entry.amount)}</strong> on{' '}
          <strong>{entry.lineItem?.name}</strong> will be removed and the money goes back
          to the pot. This cannot be undone.
        </ConfirmDialog>
      )}

      {showEdit && (
        <Modal title="Edit transaction" onClose={() => setShowEdit(false)}>
          <TransactionForm
            monthId={monthId}
            potId={potId}
            lineItemId={lineItemId}
            transaction={entry}
            onSuccess={() => setShowEdit(false)}
          />
        </Modal>
      )}
    </>
  );
}

// ── Table ──────────────────────────────────────────────────────────────────
// Receives a flat list of spend log entries (already merged from infinite
// query pages by the parent).
export default function SpendLogTable({ entries = [], monthId, isLocked }) {
  if (entries.length === 0) {
    return (
      <p className={styles.empty}>No transactions found.</p>
    );
  }

  return (
    <div className={styles.txnList}>
      {entries.map((entry) => (
        <TxnRow
          key={entry._id}
          entry={entry}
          monthId={monthId}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
}
