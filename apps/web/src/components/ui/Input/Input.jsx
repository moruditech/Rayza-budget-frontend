import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(function Input(
  { label, error, id, type = 'text', className = '', ...rest },
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
      <input
        ref={ref}
        id={fieldId}
        type={type}
        className={[styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${fieldId}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
