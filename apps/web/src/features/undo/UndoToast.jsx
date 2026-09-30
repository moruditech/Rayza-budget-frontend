import { useEffect } from 'react';
import { useUndoStore, UNDO_DELAY_MS } from '../../store/undoStore';
import styles from './UndoToast.module.css';

// Bottom-of-screen messages: "<name> deleted  Undo" while a delete can still be
// cancelled, and a short notice if a delete failed.
export default function UndoToast() {
  const pending = useUndoStore((s) => s.pending);
  const notices = useUndoStore((s) => s.notices);
  const undo = useUndoStore((s) => s.undo);
  const dismissNotice = useUndoStore((s) => s.dismissNotice);

  // Leaving the app makes any pending delete final straight away.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') useUndoStore.getState().flushAll();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  useEffect(() => {
    if (notices.length === 0) return undefined;
    const timer = setTimeout(() => dismissNotice(notices[0].id), 4000);
    return () => clearTimeout(timer);
  }, [notices, dismissNotice]);

  if (pending.length === 0 && notices.length === 0) return null;

  return (
    <div className={styles.stack} role="status" aria-live="polite">
      {notices.map((n) => (
        <div key={n.id} className={[styles.toast, styles.notice].join(' ')}>
          <span className={styles.text}>{n.text}</span>
        </div>
      ))}
      {pending.slice(-3).map((p) => (
        <div key={p.key} className={styles.toast}>
          <span className={styles.text}>{p.label}</span>
          <button className={styles.undo} onClick={() => undo(p.key)} type="button">
            Undo
          </button>
          <span className={styles.bar} style={{ animationDuration: `${UNDO_DELAY_MS}ms` }} />
        </div>
      ))}
    </div>
  );
}
