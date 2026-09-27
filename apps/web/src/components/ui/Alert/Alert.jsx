import styles from './Alert.module.css';

// variant: 'warn' | 'ready' — matches .note.warn / .note.ready in the design.
// icon: an SVG element to render on the left.
export default function Alert({ variant = 'warn', icon, children, className = '' }) {
  return (
    <div
      className={[styles.note, styles[variant], className].filter(Boolean).join(' ')}
      role={variant === 'warn' ? 'alert' : 'status'}
    >
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
