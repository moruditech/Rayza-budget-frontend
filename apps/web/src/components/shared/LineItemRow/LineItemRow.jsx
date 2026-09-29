import { useState } from 'react';
import { LINE_ITEM_TYPES } from '@budget-app/shared';
import ProgressRing from '../../ui/ProgressRing/ProgressRing';
import MarkUsedModal from '../../../features/lineItems/components/MarkUsedModal';
import AddMoneyModal from '../../../features/lineItems/components/AddMoneyModal';
import WithdrawModal from '../../../features/lineItems/components/WithdrawModal';
import TransferModal from '../../../features/lineItems/components/TransferModal';
import LineItemForm from '../../../features/lineItems/components/LineItemForm';
import TransactionForm from '../../../features/transactions/components/TransactionForm';
import Modal from '../../ui/Modal/Modal';
import { useDeleteLineItem } from '../../../features/lineItems/hooks/useLineItems';
import { formatCurrency } from '../../../utils/formatCurrency';
import { shortDate } from '../../../utils/formatDate';
import { describeFundEntry } from '../../../utils/fundActivityText';
import styles from './LineItemRow.module.css';

// Maps pot type → CSS custom property for the instant-spend dot colour.
const TYPE_COLOR = {
  SPENDING:   '--warning',
  SAVING:     '--primary',
  INVESTMENT: '--gold',
};

function formatTargetDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
}

export default function LineItemRow({ lineItem, pot, monthId, isLocked }) {
  const [showMarkUsed,  setShowMarkUsed]  = useState(false);
  const [showEditForm,  setShowEditForm]  = useState(false);
  const [showLogSpend,  setShowLogSpend]  = useState(false);
  const [showAddMoney,  setShowAddMoney]  = useState(false);
  const [showWithdraw,  setShowWithdraw]  = useState(false);
  const [showTransfer,  setShowTransfer]  = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);

  const deleteMutation = useDeleteLineItem(monthId, pot._id);
  const isSinking      = lineItem.type === LINE_ITEM_TYPES.SINKING_FUND;
  const dotColor       = TYPE_COLOR[pot.type] ?? '--primary';
  const balance        = lineItem.accumulatedBalance ?? 0;
  const projection     = lineItem.projection;
  const activity       = lineItem.activity ?? [];

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

          {/* Interest-bearing fund: projected future value beside the balance */}
          {isSinking && projection && (
            <span className={styles.projection}>
              Projected {formatCurrency(projection.projectedFutureValue)} by{' '}
              {formatTargetDate(projection.targetDate)} · {projection.annualInterestRate}% p.a.
              {' '}(+{formatCurrency(projection.projectedInterest)} interest)
            </span>
          )}

          {/* Withdraw / move — allowed at any time, before or after the target */}
          {isSinking && !isLocked && (
            <div className={styles.fundChips}>
              {lineItem.isReadyToUse && (
                <button
                  className={styles.chipReady}
                  onClick={() => setShowMarkUsed(true)}
                  type="button"
                >
                  Mark as used
                </button>
              )}
              <button
                className={styles.chipFund}
                onClick={() => setShowAddMoney(true)}
                disabled={(pot.remaining ?? 0) <= 0}
                type="button"
              >
                Add money
              </button>
              <button
                className={styles.chipFund}
                onClick={() => setShowWithdraw(true)}
                disabled={balance <= 0}
                type="button"
              >
                Withdraw
              </button>
              <button
                className={styles.chipFund}
                onClick={() => setShowTransfer(true)}
                disabled={balance <= 0}
                type="button"
              >
                Move
              </button>
            </div>
          )}

          {/* History: what was received, withdrawn or moved, and where to/from */}
          {isSinking && activity.length > 0 && (
            <>
              <button
                className={styles.historyToggle}
                onClick={() => setShowHistory((v) => !v)}
                aria-expanded={showHistory}
                type="button"
              >
                {showHistory ? 'Hide history' : `History (${activity.length})`}
              </button>
              {showHistory && (
                <ul className={styles.history}>
                  {activity.map((entry) => (
                    <li key={entry._id} className={styles.historyItem}>
                      <span className={(entry.type === 'TRANSFER_IN' || entry.type === 'SINKING_FUND_DEPOSIT') ? styles.historyIn : styles.historyOut}>
                        {describeFundEntry(entry)}
                      </span>
                      <span className={styles.historyDate}>{shortDate(entry.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
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

      {showAddMoney && (
        <AddMoneyModal
          lineItem={lineItem}
          pot={pot}
          monthId={monthId}
          onClose={() => setShowAddMoney(false)}
        />
      )}

      {showWithdraw && (
        <WithdrawModal
          lineItem={lineItem}
          potId={pot._id}
          monthId={monthId}
          onClose={() => setShowWithdraw(false)}
        />
      )}

      {showTransfer && (
        <TransferModal
          lineItem={lineItem}
          monthId={monthId}
          onClose={() => setShowTransfer(false)}
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
