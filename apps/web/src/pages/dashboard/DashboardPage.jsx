import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMonthStore } from '../../store/monthStore';
import { useMonth } from '../../features/months/hooks/useMonth';
import { useAlerts } from '../../features/alerts/hooks/useAlerts';
import IncomeBar from '../../components/shared/IncomeBar/IncomeBar';
import IncomeList from '../../features/income/components/IncomeList';
import IncomeForm from '../../features/income/components/IncomeForm';
import AlertBanner from '../../features/alerts/components/AlertBanner';
import Modal from '../../components/ui/Modal/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './DashboardPage.module.css';

function daysLeftInMonth(year, month) {
  const now = new Date();
  const isNow = now.getFullYear() === year && now.getMonth() + 1 === month;
  if (!isNow) return null;
  const lastDay = new Date(year, month, 0).getDate();
  return Math.max(lastDay - now.getDate(), 0);
}

function NoMonth() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>No budget for this period</p>
      <p className={styles.emptyHint}>
        <Link to="/months" className={styles.emptyLink}>Create a month</Link>{' '}
        to get started.
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Loading dashboard">
      <div className={styles.skeletonHero} />
      <div className={styles.skeletonRow} />
      <div className={styles.skeletonRow} style={{ width: '70%' }} />
      <div className={styles.skeletonStats} />
    </div>
  );
}

export default function DashboardPage() {
  const { activeMonthId } = useMonthStore();
  const { data: month, isLoading } = useMonth(activeMonthId);
  const { data: alerts = [] } = useAlerts();
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  if (!activeMonthId) return <NoMonth />;
  if (isLoading) return <Skeleton />;

  const {
    year,
    month: monthNum,
    income = [],
    pots = [],
    totalIncome = 0,
    unallocatedIncome = 0,
    isLocked,
  } = month;

  const totalSpent = pots.reduce((s, p) => s + (p.spentAmount ?? 0), 0);
  const totalSavedInvested = pots
    .filter((p) => p.type === 'SAVING' || p.type === 'INVESTMENT')
    .reduce((s, p) => s + (p.spentAmount ?? 0), 0);
  const daysLeft = daysLeftInMonth(year, monthNum);
  const isOverAllocated = unallocatedIncome < 0;

  return (
    <>
      <div className={styles.hero}>
        <p className={styles.heroLabel}>Total income</p>
        <p className={styles.heroAmount}>{formatCurrency(totalIncome)}</p>
        <IncomeBar
          pots={pots}
          totalIncome={totalIncome}
          unallocatedIncome={unallocatedIncome}
        />
        <p
          className={styles.heroCaption}
          style={{ color: isOverAllocated ? 'var(--warning)' : undefined }}
        >
          {isOverAllocated
            ? `Over allocated by ${formatCurrency(-unallocatedIncome)} — reduce a pot's budget`
            : `${formatCurrency(unallocatedIncome)} not yet assigned to a pot`}
        </p>
      </div>

      <IncomeList income={income} monthId={activeMonthId} isLocked={isLocked} />

      {!isLocked && (
        <button
          className={styles.btnAddIncome}
          onClick={() => setShowIncomeModal(true)}
          type="button"
        >
          + Add income source
        </button>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <b>{formatCurrency(totalSpent)}</b>
          <span>Used this month</span>
        </div>
        <div className={styles.stat}>
          <b>{formatCurrency(totalSavedInvested)}</b>
          <span>Saved &amp; invested</span>
        </div>
        <div className={styles.stat}>
          <b>{daysLeft !== null ? daysLeft : '—'}</b>
          <span>Days left</span>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className={styles.alerts}>
          {alerts.map((alert, i) => (
            <AlertBanner key={`${alert.type}-${i}`} alert={alert} />
          ))}
        </div>
      )}

      {showIncomeModal && (
        <Modal
          title="Add income source"
          onClose={() => setShowIncomeModal(false)}
        >
          <IncomeForm
            monthId={activeMonthId}
            onSuccess={() => setShowIncomeModal(false)}
          />
        </Modal>
      )}
    </>
  );
}
