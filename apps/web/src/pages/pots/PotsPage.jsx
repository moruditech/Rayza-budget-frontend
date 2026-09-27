import { useState } from 'react';
import { useMonthStore } from '../../store/monthStore';
import { useMonth } from '../../features/months/hooks/useMonth';
import PotCard from '../../components/shared/PotCard/PotCard';
import PotForm from '../../features/pots/components/PotForm';
import Modal from '../../components/ui/Modal/Modal';
import styles from './PotsPage.module.css';

// ── Empty / loading states ────────────────────────────────────────────────

function NoPots() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No pots yet</p>
      <p className={styles.emptyHint}>
        Add a pot to start allocating your income.
      </p>
    </div>
  );
}

function NoMonth() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No budget for this period</p>
      <p className={styles.emptyHint}>
        Create a month from the Months screen to get started.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Loading pots">
      {[1, 2, 3].map((n) => (
        <div key={n} className={styles.skeletonCard} />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function PotsPage() {
  const { activeMonthId }     = useMonthStore();
  const { data: month, isLoading } = useMonth(activeMonthId);
  const [showPotForm, setShowPotForm] = useState(false);

  if (!activeMonthId) return <NoMonth />;
  if (isLoading)      return <Skeleton />;

  const { pots = [], isLocked } = month;

  return (
    <>
      {/* Pot list */}
      {pots.length === 0 ? (
        <NoPots />
      ) : (
        <div className={styles.list}>
          {pots.map((pot) => (
            <PotCard
              key={pot._id}
              pot={pot}
              monthId={activeMonthId}
              isLocked={isLocked}
            />
          ))}
        </div>
      )}

      {/* FR-03 — add pot button (hidden on locked months) */}
      {!isLocked && (
        <button
          className={styles.btnAdd}
          onClick={() => setShowPotForm(true)}
          type="button"
        >
          + Add pot
        </button>
      )}

      {showPotForm && (
        <Modal title="Add pot" onClose={() => setShowPotForm(false)}>
          <PotForm
            monthId={activeMonthId}
            onSuccess={() => setShowPotForm(false)}
          />
        </Modal>
      )}
    </>
  );
}
