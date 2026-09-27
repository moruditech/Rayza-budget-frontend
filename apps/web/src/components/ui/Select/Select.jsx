import { forwardRef } from 'react';
import styles from './Select.module.css';

const Select = forwardRef(function Select(
  { label, error, id, children, className = '', ...rest },
  ref
) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={[styles.group, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        className={[styles.select, error ? styles.selectError : ''].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default Select;
