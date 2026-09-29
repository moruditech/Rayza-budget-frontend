import { useState } from 'react';
import { useDeleteMonth } from '../hooks/useMonthMutations';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import { monthLabel } from '../../../utils/formatDate';
import styles from './DeleteMonthModal.module.css';

// Permanent delete of a whole month. Asks for confirmation and spells out
// what disappears; locked months get an extra warning because their health
// score and history are removed too.
export default function DeleteMonthModal({ month, onClose }) {
  const [error, setError] = useState(null);
  const mutation = useDeleteMonth();
  const label = monthLabel(month.year, month.month);

  const handleDelete = () => {
    setError(null);
    mutation.mutate(month._id, {
      onSuccess: onClose,
      onError: (err) => {
        const code = err?.response?.data?.error?.code;
        setError(
          code === 'NOT_FOUND'
            ? 'This month no longer exists.'
            : 'Could not delete the month. Please try again.'
        );
      },
    });
  };

  return (
    <Modal title={`Delete ${label}?`} onClose={onClose}>
      <div className={styles.body}>
        {error && <Alert variant="warn">{error}</Alert>}

        <p className={styles.text}>
          This permanently removes <strong>{label}</strong> with all of its income,
          pots, line items and spending history. This cannot be undone.
        </p>

        <p className={styles.note}>
          Other months are not changed. Money already carried into later months
          (sinking fund balances, rollovers) stays as it is.
        </p>

        {month.isLocked && (
          <Alert variant="warn">
            This month is locked. Its health score and history will be lost too.
          </Alert>
        )}

        <Button
          className={styles.danger}
          onClick={handleDelete}
          loading={mutation.isPending}
        >
          Delete {label}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
