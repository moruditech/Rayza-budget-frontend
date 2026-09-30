import { useEffect, useState } from 'react';
import styles from './SpendLogSearch.module.css';

const EMPTY = { search: '', potId: '', minAmount: '', maxAmount: '' };

// Search + pot + amount range for the Activity list.
// `value` / `onChange` use strings straight from the inputs; the page turns
// them into query params. Typing is debounced so each keystroke is not a request.
export default function SpendLogSearch({ pots = [], value, onChange }) {
  const [text, setText] = useState(value.search);

  useEffect(() => {
    if (text === value.search) return undefined;
    const t = setTimeout(() => onChange({ ...value, search: text }), 300);
    return () => clearTimeout(t);
  }, [text, value, onChange]);

  const active = value.search || value.potId || value.minAmount !== '' || value.maxAmount !== '';

  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className={styles.wrap}>
      <input
        className={styles.input}
        type="search"
        placeholder="Search"
        aria-label="Search"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className={styles.row}>
        <select className={styles.input} aria-label="Pot" value={value.potId} onChange={set('potId')}>
          <option value="">All pots</option>
          {pots.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          className={styles.input}
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="Min R"
          aria-label="Minimum amount"
          value={value.minAmount}
          onChange={set('minAmount')}
        />
        <input
          className={styles.input}
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="Max R"
          aria-label="Maximum amount"
          value={value.maxAmount}
          onChange={set('maxAmount')}
        />
        {active && (
          <button
            className={styles.clear}
            type="button"
            onClick={() => {
              setText('');
              onChange(EMPTY);
            }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export const EMPTY_SEARCH = EMPTY;
