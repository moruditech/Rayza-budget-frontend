import { useState } from 'react';
import { useMonth } from '../../months/hooks/useMonth';
import { useRollover, useLockMonth } from '../../months/hooks/useMonthMutations';
import Modal from '../../../components/ui/Modal/Modal';
import Button from '../../../components/ui/Button/Button';
import Alert from '../../../components/ui/Alert/Alert';
import Select from '../../../components/ui/Select/Select';
import { formatCurrency } from '../../../utils/formatCurrency';
import styles from './LockMonthModal.module.css';

const ACTIONS = ['RESET', 'ROLLOVER', 'SWEEP'];
const ACTION_LABEL = {
  RESET:    'Reset',
  ROLLOVER: 'Roll over',
  SWEEP:    'Sweep to…',
};

export default function LockMonthModal({ monthId, onClose }) {
  const { data: month } = useMonth(monthId);

  // One decision object per pot: { action, targetPotId? }
  const [decisions, setDecisions] = useState({});
  const [error,     setError]     = useState(null);
  const [score,     setScore]     = useState(null); // set on success

  const rolloverMutation = useRollover();
  const lockMutation     = useLockMonth();

  const isPending = rolloverMutation.isPending || lockMutation.isPending;

  const potsWithSurplus = (month?.pots ?? []).filter(
    (p) => (p.surplus ?? 0) > 0
  );

  const otherPots = (potId) =>
    (month?.pots ?? []).filter((p) => p._id !== potId);

  const getDecision = (potId) =>
    decisions[potId] ?? { action: 'RESET', targetPotId: null };

  const setAction = (potId, action) =>
    setDecisions((prev) => ({
      ...prev,
      [potId]: { action, targetPotId: null },
    }));

  const setSweepTarget = (potId, targetPotId) =>
    setDecisions((prev) => ({
      ...prev,
      [potId]: { ...prev[potId], targetPotId },
    }));

  const handleLock = async () => {
    setError(null);
    try {
      // FR-07 — submit rollover decisions first (even if none, it's a no-op).
      if (potsWithSurplus.length > 0) {
        const payload = potsWithSurplus.map((pot) => {
          const d = getDecision(pot._id);
          return {
            potId:       pot._id,
            action:      d.action,
            ...(d.action === 'SWEEP' ? { targetPotId: d.targetPotId } : {}),
          };
        });
        await rolloverMutation.mutateAsync({ id: monthId, decisions: payload });
      }

      // FR-08 — lock the month and capture the computed health score.
      const result = await lockMutation.mutateAsync(monthId);
      setScore(result.healthScore ?? null);
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      if (code === 'ALREADY_LOCKED') {
        setError('This month is already locked.');
      } else if (code === 'INVALID_TARGET_POT') {
        setError('One of the sweep targets is invalid. Please check your selections.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (score !== null) {
    return (
      <Modal title="Month locked" onClose={onClose}>
        <div className={styles.successBody}>
          {score != null ? (
            <>
              <p className={styles.successLabel}>Budget Health Score</p>
              <p className={styles.successScore}>{score}</p>
              <p className={styles.successHint}>
                {score >= 80
                  ? 'Great discipline this month.'
                  : score >= 60
                  ? 'Decent month — a few areas to improve.'
                  : 'Needs work — review your pots for next month.'}
              </p>
            </>
          ) : (
            <p className={styles.successHint}>Month locked successfully.</p>
          )}
          <Button onClick={onClose}>Done</Button>
        </div>
      </Modal>
    );
  }

  // ── Rollover + confirm screen ───────────────────────────────────────────
  return (
    <Modal title="Lock month" onClose={onClose}>
      <div className={styles.body}>
        {error && <Alert variant="warn">{error}</Alert>}

        {potsWithSurplus.length > 0 ? (
          <>
            <p className={styles.intro}>
              The following pots have surplus. Choose what to do with each before locking.
            </p>

            {potsWithSurplus.map((pot) => {
              const d = getDecision(pot._id);
              return (
                <div key={pot._id} className={styles.potDecision}>
                  <div className={styles.potInfo}>
                    <b className={styles.potName}>{pot.name}</b>
                    <span className={styles.potSurplus}>
                      Surplus: {formatCurrency(pot.surplus)}
                    </span>
                  </div>

                  {/* Action toggle */}
                  <div className={styles.actionBtns}>
                    {ACTIONS.map((action) => (
                      <button
                        key={action}
                        type="button"
                        className={[
                          styles.actionBtn,
                          d.action === action ? styles.actionBtnActive : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => setAction(pot._id, action)}
                      >
                        {ACTION_LABEL[action]}
                      </button>
                    ))}
                  </div>

                  {/* Sweep target selector */}
                  {d.action === 'SWEEP' && (
                    <Select
                      label="Target pot"
                      value={d.targetPotId ?? ''}
                      onChange={(e) => setSweepTarget(pot._id, e.target.value)}
                    >
                      <option value="" disabled>Select a pot…</option>
                      {otherPots(pot._id).map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <p className={styles.intro}>
            No pots have a surplus. Locking this month will finalise your budget
            history and compute your health score.
          </p>
        )}

        <Button
          onClick={handleLock}
          loading={isPending}
          style={{ marginTop: 4 }}
        >
          Lock month
        </Button>
      </div>
    </Modal>
  );
}
