import styles from './Button.module.css';

// variant: 'primary' | 'ghost'
// size:    'md' (default) | 'sm'
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        loading ? styles.loading : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <span className={loading ? styles.hidden : ''}>{children}</span>
    </button>
  );
}
