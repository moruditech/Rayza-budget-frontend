import { useState } from 'react';
import { LINE_ITEM_TYPES } from '@budget-app/shared';
import ProgressRing from '../../ui/ProgressRing/ProgressRing';
import MarkUsedModal from '../../../features/lineItems/components/MarkUsedModal';
import ConfirmDialog from '../../ui/ConfirmDialog/ConfirmDialog';
import RecordInterestModal from '../../../features/lineItems/components/RecordInterestModal';
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
import { useMarkPaid } from '../../../features/lineItems/hooks/useLineItems';
import styles from './LineItemRow.module.css';

// Maps pot type → CSS custom property for the instant-spend dot colour.
const TYPE_COLOR = {
  SPENDING:   '--warning',
  SAVING:     '--primary',
  INVESTMENT: '--gold',
};

// "25 Oct" — the bill's due date (a UTC calendar day, so no timezone drift).
function formatDueDate(date) {
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function formatTargetDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
}

export default function LineItemRow({ lineItem, pot, monthId, isLocked }) {
  const [showMarkUsed,  setShowMarkUsed]  = useState(false);
  const [showEditForm,  setShowEditForm]  = useState(false);
  const [showLogSpend,  setShowLogSpend]  = useState(false);
  const [showAddMoney,  setShowAddMoney]  = useState(false);
  const [showInterest,  setShowInterest]  = useState(false);
  const [showWithdraw,  setShowWithdraw]  = useState(false);
  const [showTransfer,  setShowTransfer]  = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useDeleteLineItem(monthId, pot._id);
  const isSinking      = lineItem.type === LINE_ITEM_TYPES.SINKING_FUND;
  const dotColor       = TYPE_COLOR[pot.type] ?? '--primary';
  const balance        = lineItem.accumulatedBalance ?? 0;
  const projection     = lineItem.projection;
  const activity       = lineItem.activity ?? [];
  const markPaid       = useMarkPaid(monthId, pot._id);
  const isBill         = lineItem.dueDay != null;
  const dueDate        = lineItem.dueDate ? new Date(lineItem.dueDate) : null;
  const today          = new Date();
  const todayUtc       = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const isOverdue      = isBill && !lineItem.isPaid && dueDate && dueDate.getTime() < todayUtc;
  const progressCheck  = lineItem.progressCheck;
  const earnsInterest  = lineItem.annualInterestRate != null;

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

          {/* Bills: due date, and a Mark paid button the person controls */}
          {isBill && (
            <div className={styles.billRow}>
              <span
                className={[
                  styles.billText,
                  lineItem.isPaid ? styles.billPaid : isOverdue ? styles.billOverdue : '',
                ].join(' ')}
              >
                {lineItem.isPaid
                  ? 'Paid'
                  : `${isOverdue ? 'Overdue, was due' : 'Due'} ${
                      dueDate ? formatDueDate(dueDate) : `the ${lineItem.dueDay}th`
                    }`}
              </span>
              {!isLocked && (
                <button
                  className={styles.chipFund}
                  onClick={() => markPaid.mutate({ id: lineItem._id, paid: !lineItem.isPaid })}
                  disabled={markPaid.isPending}
                  type="button"
                >
                  {lineItem.isPaid ? 'Undo' : 'Mark paid'}
                </button>
              )}
            </div>
          )}

          {/* Interest-bearing fund: projected future value beside the balance */}
          {isSinking && projection && (
            <span className={styles.projection}>
              Projected {formatCurrency(projection.projectedFutureValue)} by{' '}
              {formatTargetDate(projection.targetDate)} · {projection.annualInterestRate}% p.a.
              {' '}(+{formatCurrency(projection.projectedInterest)} interest)
            </span>
          )}

          {/* Real interest the bank has paid so far */}
          {isSinking && earnsInterest && (lineItem.interestEarned ?? 0) > 0 && (
            <span className={styles.interestEarned}>
              Interest earned so far {formatCurrency(lineItem.interestEarned)}
            </span>
          )}

          {/* "Am I on track?" — needs a target amount and a goal date */}
          {isSinking && progressCheck && (
            <span
              className={[
                styles.goalLine,
                progressCheck.status === 'BEHIND' ? styles.goalBehind : styles.goalOk,
              ].join(' ')}
            >
              {progressCheck.status === 'REACHED' && 'Target reached'}
              {progressCheck.status === 'ON_TRACK' &&
                `On track: ${formatCurrency(progressCheck.currentMonthly)}/month covers the ${formatCurrency(progressCheck.requiredMonthly)}/month needed by ${formatTargetDate(progressCheck.goalDate)}`}
              {progressCheck.status === 'BEHIND' &&
                (progressCheck.months === 0
                  ? `Goal date reached: ${formatCurrency(progressCheck.requiredMonthly)} still needed`
                  : `Behind: needs ${formatCurrency(progressCheck.requiredMonthly)}/month by ${formatTargetDate(progressCheck.goalDate)}, you put in ${formatCurrency(progressCheck.currentMonthly)}`)}
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
              {earnsInterest && (
                <button
                  className={styles.chipFund}
                  onClick={() => setShowInterest(true)}
                  type="button"
                >
                  Record interest
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
                      <span className={(entry.type === 'TRANSFER_IN' || entry.type === 'SINKING_FUND_DEPOSIT' || entry.type === 'SINKING_FUND_INTEREST') ? styles.historyIn : styles.historyOut}>
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
                onClick={() => setConfirmDelete(true)}
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

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${lineItem.name}?`}
          loading={deleteMutation.isPending}
          error={
            deleteMutation.isError ? 'Could not delete this item. Please try again.' : null
          }
          warning={
            isSinking && balance > 0
              ? `This fund holds ${formatCurrency(balance)}. That money will no longer be tracked.`
              : null
          }
          onConfirm={() =>
            deleteMutation.mutate(lineItem._id, { onSuccess: () => setConfirmDelete(false) })
          }
          onClose={() => setConfirmDelete(false)}
        >
          <strong>{lineItem.name}</strong> and its spending history will be permanently
          removed from this pot. This cannot be undone.
        </ConfirmDialog>
      )}

      {showInterest && (
        <RecordInterestModal
          lineItem={lineItem}
          potId={pot._id}
          monthId={monthId}
          onClose={() => setShowInterest(false)}
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
