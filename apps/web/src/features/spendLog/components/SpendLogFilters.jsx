import styles from './SpendLogFilters.module.css';

// FR-10 — filter chips. Matches the HTML demo exactly:
//   All · Cash · Card · EFT · Other
// `active` is the selected paymentMethod value (null = All).
// `onChange` receives the new value (null or a PAYMENT_METHODS string).
const FILTERS = [
  { label: 'All',   value: null   },
  { label: 'Cash',  value: 'CASH' },
  { label: 'Card',  value: 'CARD' },
  { label: 'EFT',   value: 'EFT'  },
  { label: 'Other', value: 'OTHER' },
];

export default function SpendLogFilters({ active, onChange }) {
  return (
    <div className={styles.filters} role="group" aria-label="Filter by payment method">
      {FILTERS.map((f) => (
        <button
          key={f.label}
          type="button"
          className={[
            styles.chip,
            active === f.value ? styles.chipActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onChange(f.value)}
          aria-pressed={active === f.value}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
