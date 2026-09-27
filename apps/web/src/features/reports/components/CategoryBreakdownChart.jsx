import styles from './CategoryBreakdownChart.module.css';

const R             = 40;
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 251.3

const TYPE_COLOR = {
  SPENDING:   '--warning',
  SAVING:     '--primary',
  INVESTMENT: '--gold',
};

const TYPE_LABEL = {
  SPENDING:   'Spending',
  SAVING:     'Saving',
  INVESTMENT: 'Investment',
};

// FR-14 — Category Breakdown donut chart.
// SVG implementation matches the HTML design exactly:
//   viewBox="0 0 120 120", r=40, strokeWidth=20
// Each segment is a <circle> with stroke-dasharray / stroke-dashoffset.
export default function CategoryBreakdownChart({ data = [] }) {
  if (data.length === 0) {
    return <p className={styles.empty}>No pot data for this month.</p>;
  }

  const total = data.reduce((s, c) => s + (c.totalBudget ?? 0), 0) || 1;

  // Build segments with running offset so each arc starts where the last ended.
  let runningOffset = 0;
  const segments = data
    .filter((c) => c.totalBudget > 0)
    .map((cat) => {
      const pct  = cat.totalBudget / total;
      const dash = pct * CIRCUMFERENCE;
      const seg  = { ...cat, pct, dash, offset: runningOffset };
      runningOffset += pct;
      return seg;
    });

  return (
    <div className={styles.donutWrap}>
      <svg
        className={styles.donut}
        viewBox="0 0 120 120"
        aria-label="Category breakdown donut chart"
        role="img"
      >
        {segments.map((seg) => (
          <circle
            key={seg.type}
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={`var(${TYPE_COLOR[seg.type] ?? '--border'})`}
            strokeWidth="20"
            strokeDasharray={`${seg.dash} ${CIRCUMFERENCE - seg.dash}`}
            strokeDashoffset={`${-seg.offset * CIRCUMFERENCE}`}
            transform="rotate(-90 60 60)"
          />
        ))}
      </svg>

      <div className={styles.legend}>
        {segments.map((seg) => (
          <div key={seg.type} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: `var(${TYPE_COLOR[seg.type]})` }}
            />
            <span>
              {TYPE_LABEL[seg.type] ?? seg.type}{' '}
              <strong>{Math.round(seg.percentOfIncome ?? seg.pct * 100)}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
