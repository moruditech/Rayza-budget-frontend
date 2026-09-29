import { useState } from 'react';
import Modal from '../../../components/ui/Modal/Modal';
import Alert from '../../../components/ui/Alert/Alert';
import { exportMonth } from '../exportMonth';
import { monthLabel } from '../../../utils/formatDate';
import styles from './ExportMonthModal.module.css';

// Download a month for your records: a spreadsheet-friendly CSV, or a PDF
// statement. Both include income, pots, line items, sinking funds (with
// interest and goal progress) and every activity entry.
export default function ExportMonthModal({ month, onClose }) {
  const [busy, setBusy] = useState(null); // 'csv' | 'pdf' | null
  const [error, setError] = useState(null);

  const run = async (format) => {
    setBusy(format);
    setError(null);
    try {
      await exportMonth(month._id, format);
      onClose();
    } catch {
      setError('Could not create the file. Check your connection and try again.');
      setBusy(null);
    }
  };

  return (
    <Modal title={`Export ${monthLabel(month.year, month.month)}`} onClose={busy ? () => {} : onClose}>
      <div className={styles.body}>
        {error && <Alert variant="warn">{error}</Alert>}

        <p className={styles.text}>
          Includes income, pots, line items, sinking funds and every transaction in the month.
        </p>

        <button
          className={styles.option}
          onClick={() => run('pdf')}
          disabled={!!busy}
          type="button"
        >
          <span className={styles.optionTitle}>
            {busy === 'pdf' ? 'Creating PDF…' : 'PDF statement'}
          </span>
          <span className={styles.optionHint}>Easy to read, share or print</span>
        </button>

        <button
          className={styles.option}
          onClick={() => run('csv')}
          disabled={!!busy}
          type="button"
        >
          <span className={styles.optionTitle}>
            {busy === 'csv' ? 'Creating CSV…' : 'CSV spreadsheet'}
          </span>
          <span className={styles.optionHint}>Opens in Excel or Google Sheets</span>
        </button>
      </div>
    </Modal>
  );
}
