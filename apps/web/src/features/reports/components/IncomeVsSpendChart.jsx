import styles from './IncomeVsSpendChart.module.css';
import { formatCurrency } from '../../../utils/formatCurrency';

// FR-14 — Income vs Total Spend bar chart.
// Matches the .bar-groups / .bar / .bar-legend pattern from the HTML design.
// Uses CSS percentage heights inside a fixed-height container so no
// external chart library is needed and the visual is pixel-perfect.
export default function IncomeVsSpendChart({ data = [] }) {
  if (data.length === 0) {
    return <p className={styles.empty}>No data yet — lock a month to see trends.</p>;
  }

  const max = Math.max(...data.flatMap((d) => [d.income, d.spent]), 1);

  return (
    <div>
      <div className={styles.barGroups}>
        {data.map((d) => (
          <div key={d.month} className={styles.barGroup}>
            <div className={styles.bars}>
              <div
                className={[styles.bar, styles.barIncome].join(' ')}
                style={{ height: `${(d.income / max) * 100}%` }}
                title={`Income ${formatCurrency(d.income)}`}
              />
              <div
                className={[styles.bar, styles.barSpent].join(' ')}
                style={{ height: `${(d.spent / max) * 100}%` }}
                title={`Spent ${formatCurrency(d.spent)}`}
              />
            </div>
            {/* Show only first 3 chars of month label: "Apr", "May"… */}
            <span className={styles.barLabel}>{d.month.slice(0, 3)}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={[styles.bl, styles.blIncome].join(' ')}>Income</span>
        <span className={[styles.bl, styles.blSpent].join(' ')}>Spent</span>
      </div>
    </div>
  );
}
