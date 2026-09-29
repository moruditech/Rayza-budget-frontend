import { useState, useEffect, useRef } from 'react';
import { useUpdateIncome, useDeleteIncome } from '../hooks/useIncome';
import ConfirmDialog from '../../../components/ui/ConfirmDialog/ConfirmDialog';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './IncomeList.module.css';

// One editable row per income source.
// Saves on blur if either the label or amount changed.
function IncomeRow({ item, monthId, isLocked }) {
  const [label, setLabel]   = useState(item.label);
  const [amount, setAmount] = useState(String(item.amount));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateMutation = useUpdateIncome(monthId);
  const deleteMutation = useDeleteIncome(monthId);

  // Keep local state in sync when the server data refreshes after a save.
  useEffect(() => { setLabel(item.label); },        [item.label]);
  useEffect(() => { setAmount(String(item.amount)); }, [item.amount]);

  const savedLabel  = useRef(item.label);
  const savedAmount = useRef(item.amount);

  const save = () => {
    const numAmount = parseFloat(amount) || 0;
    const changes   = {};

    if (label.trim() !== savedLabel.current)  changes.label  = label.trim();
    if (numAmount     !== savedAmount.current) changes.amount = numAmount;

    if (Object.keys(changes).length === 0) return;

    updateMutation.mutate(
      { id: item._id, ...changes },
      {
        onSuccess: () => {
          savedLabel.current  = changes.label  ?? savedLabel.current;
          savedAmount.current = changes.amount ?? savedAmount.current;
        },
        onError: () => {
          // Roll back local state on failure.
          setLabel(savedLabel.current);
          setAmount(String(savedAmount.current));
        },
      }
    );
  };

  return (
    <div className={styles.row}>
      <input
        className={styles.incLabel}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={save}
        disabled={isLocked}
        aria-label="Income label"
      />
      <div className={styles.incAmt}>
        <span className={styles.cur}>R</span>
        <input
          className={styles.incAmtInput}
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={save}
          disabled={isLocked}
          aria-label="Income amount"
        />
      </div>

      {!isLocked && (
        <button
          className={styles.removeBtn}
          onClick={() => setConfirmDelete(true)}
          disabled={deleteMutation.isPending}
          aria-label={`Remove ${item.label}`}
          type="button"
          title="Remove"
        >
          ✕
        </button>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Remove ${item.label}?`}
          confirmLabel="Remove"
          loading={deleteMutation.isPending}
          error={
            deleteMutation.isError ? 'Could not remove this income. Please try again.' : null
          }
          onConfirm={() =>
            deleteMutation.mutate(item._id, { onSuccess: () => setConfirmDelete(false) })
          }
          onClose={() => setConfirmDelete(false)}
        >
          <strong>{item.label}</strong> ({formatCurrency(item.amount)}) will be removed from
          this month&apos;s income, which lowers what you have available to allocate.
        </ConfirmDialog>
      )}
    </div>
  );
}

// Renders all income sources for the active month.
export default function IncomeList({ income = [], monthId, isLocked }) {
  if (income.length === 0) return null;

  return (
    <div className={styles.list}>
      {income.map((item) => (
        <IncomeRow
          key={item._id}
          item={item}
          monthId={monthId}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
}
