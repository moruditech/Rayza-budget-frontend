import { useState } from 'react';
import { useMonths } from '../../features/months/hooks/useMonths';
import { useCreateMonth } from '../../features/months/hooks/useMonthMutations';
import { useMonthStore } from '../../store/monthStore';
import MonthCard from '../../features/months/components/MonthCard';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import Select from '../../components/ui/Select/Select';
import Button from '../../components/ui/Button/Button';
import Alert from '../../components/ui/Alert/Alert';
import { monthLabel } from '../../utils/formatDate';
import styles from './MonthsPage.module.css';

// ── Month number → label helper ───────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// ── Create month form ─────────────────────────────────────────────────────
function CreateMonthForm({ onSuccess }) {
  const now = new Date();
  const [year,  setYear]  = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [error, setError] = useState(null);

  const mutation = useCreateMonth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const y = parseInt(year,  10);
    const m = parseInt(month, 10);
    if (!y || !m) return;
    mutation.mutate(
      { year: y, month: m },
      {
        onSuccess,
        onError: (err) => {
          const code = err?.response?.data?.error?.code;
          if (code === 'DUPLICATE') {
            setError(`${monthLabel(y, m)} already exists.`);
          } else {
            setError('Something went wrong. Please try again.');
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      {error && <Alert variant="warn">{error}</Alert>}

      <Input
        label="Year"
        type="number"
        inputMode="numeric"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        min={2020}
        max={2099}
      />

      <Select
        label="Month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      >
        {MONTH_NAMES.map((name, i) => (
          <option key={i + 1} value={i + 1}>
            {name}
          </option>
        ))}
      </Select>

      <Button type="submit" loading={mutation.isPending}>
        Create month
      </Button>
    </form>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true">
      {[1, 2, 3].map((n) => (
        <div key={n} className={styles.skeletonCard} />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function MonthsPage() {
  const { data: months = [], isLoading } = useMonths();
  const { activeMonthId, setActiveMonth } = useMonthStore();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {/* Month cards — newest first (API already returns them that way) */}
      {isLoading ? (
        <Skeleton />
      ) : months.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No months yet</p>
          <p className={styles.emptyHint}>Create your first budget month to get started.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {months.map((month) => (
            <MonthCard
              key={month._id}
              month={month}
              isActive={month._id === activeMonthId}
              onSelect={() => setActiveMonth(month._id)}
            />
          ))}
        </div>
      )}

      {/* Create month button */}
      <button
        className={styles.btnCreate}
        onClick={() => setShowCreate(true)}
        type="button"
      >
        + Create month
      </button>

      {showCreate && (
        <Modal title="Create month" onClose={() => setShowCreate(false)}>
          <CreateMonthForm onSuccess={() => setShowCreate(false)} />
        </Modal>
      )}
    </>
  );
}
