import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Alert from '../Alert/Alert';
import styles from './ConfirmDialog.module.css';

// Second step for destructive actions: nothing is deleted until the person
// confirms here. Cancel, Escape and tapping outside all close it untouched.
//
// Props:
//   title         — e.g. "Delete Cash Built?"
//   children      — what will happen (plain text or JSX)
//   warning       — optional stronger message shown in a warning box
//   confirmLabel  — text of the red button (default "Delete")
//   loading       — true while the request is running
//   error         — optional error message to show
//   onConfirm / onClose
export default function ConfirmDialog({
  title,
  children,
  warning,
  confirmLabel = 'Delete',
  loading = false,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal title={title} onClose={loading ? () => {} : onClose}>
      <div className={styles.body}>
        {error && <Alert variant="warn">{error}</Alert>}

        <div className={styles.text}>{children}</div>

        {warning && <Alert variant="warn">{warning}</Alert>}

        <Button className={styles.danger} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
