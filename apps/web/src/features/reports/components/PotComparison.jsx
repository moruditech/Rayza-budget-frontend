import { formatCurrency } from '../../../utils/formatCurrency';
import { monthLabel } from '../../../utils/formatDate';
import styles from './PotComparison.module.css';

// Pots whose "used" going UP is good (money moved into savings / investments);
// for spending pots going up is the warning sign.
const GOOD_WHEN_UP = new Set(['SAVING', 'INVESTMENT']);

function Change({ row }) {
  if (row.usedChange == null) {
    return <span className={styles.tag}>{row.current ? 'New' : 'Removed'}</span>;
  }
  if (row.usedChange === 0) return <span className={styles.flat}>No change</span>;

  const up = row.usedChange > 0;
  const good = GOOD_WHEN_UP.has(row.type) ? up : !up;
  return (
    <span className={good ? styles.good : styles.bad}>
      {up ? '▲' : '▼'} {formatCurrency(Math.abs(row.usedChange))}
      {row.usedChangePercent != null && ` (${Math.abs(row.usedChangePercent)}%)`}
    </span>
  );
}

const used = (snap) => (snap ? formatCurrency(snap.used) : '-');

export default function PotComparison({ data }) {
  if (!data) return null;
  if (!data.previousMonth) return <p className={styles.empty}>No previous month</p>;

  const prev = monthLabel(data.previousMonth.year, data.previousMonth.month);
  const now = monthLabel(data.month.year, data.month.month);

  return (
    <div className={styles.table} role="table" aria-label={`${now} compared with ${prev}`}>
      <div className={[styles.row, styles.head].join(' ')} role="row">
        <span role="columnheader">Pot</span>
        <span role="columnheader" className={styles.num}>{prev.split(' ')[0]}</span>
        <span role="columnheader" className={styles.num}>{now.split(' ')[0]}</span>
        <span role="columnheader" className={styles.num}>Change</span>
      </div>

      {data.pots.map((row) => (
        <div key={row.name} className={styles.row} role="row">
          <span className={styles.name} role="cell">{row.name}</span>
          <span className={styles.num} role="cell">{used(row.previous)}</span>
          <span className={styles.num} role="cell">{used(row.current)}</span>
          <span className={styles.num} role="cell"><Change row={row} /></span>
        </div>
      ))}

      <div className={[styles.row, styles.total].join(' ')} role="row">
        <span role="cell">Total</span>
        <span className={styles.num} role="cell">{formatCurrency(data.totals.previous ?? 0)}</span>
        <span className={styles.num} role="cell">{formatCurrency(data.totals.current)}</span>
        <span role="cell" />
      </div>
    </div>
  );
}
