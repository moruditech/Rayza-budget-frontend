import styles from './IncomeBar.module.css';

// Maps pot types to CSS custom properties matching the HTML design.
const TYPE_COLOR = {
  SPENDING:   '--warning',
  SAVING:     '--primary',
  INVESTMENT: '--gold',
};

// Stacked horizontal bar that breaks total income into segments —
// one per pot (coloured by type) plus an unallocated grey tail.
// Mirrors the .alloc-bar logic from the HTML design exactly.
//
// Props:
//   pots              — array of pot objects with { type, budgetLimit }
//   totalIncome       — sum of all income sources for the month
//   unallocatedIncome — totalIncome minus sum of all pot budgetLimits
export default function IncomeBar({ pots = [], totalIncome, unallocatedIncome }) {
  // Use the larger of total income or total allocated as the 100% baseline
  // so the bar never exceeds its container even when over-allocated.
  const totalAllocated = pots.reduce((s, p) => s + (p.budgetLimit ?? 0), 0);
  const base = Math.max(totalIncome, totalAllocated, 1);

  return (
    <div className={styles.bar} role="img" aria-label="Budget allocation bar">
      {pots.map((pot) => {
        const width = Math.max((pot.budgetLimit / base) * 100, 0);
        if (width === 0) return null;
        const colorVar = TYPE_COLOR[pot.type] ?? '--border';
        return (
          <span
            key={pot._id}
            className={styles.seg}
            style={{
              width: `${width}%`,
              background: `var(${colorVar})`,
            }}
            title={`${pot.name}: ${pot.budgetLimit?.toLocaleString()}`}
          />
        );
      })}

      {/* Unallocated grey tail — only rendered when income > allocations */}
      {unallocatedIncome > 0 && (
        <span
          className={styles.seg}
          style={{
            width: `${(unallocatedIncome / base) * 100}%`,
            background: 'var(--border)',
          }}
          title="Unallocated"
        />
      )}
    </div>
  );
}
