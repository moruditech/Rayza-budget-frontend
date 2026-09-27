import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

// Bottom-sheet modal — matches .modal-overlay / .modal from the HTML design.
// Renders into document.body via a portal so it sits above all page content.
//
// Props:
//   title    — string shown in the modal header
//   onClose  — called when the user clicks the overlay, the × button, or Escape
//   children — rendered inside the modal body (typically a form)
export default function Modal({ title, onClose, children }) {
  const firstFocusRef = useRef(null);

  // Close on Escape key.
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Move focus into the modal on open so keyboard navigation works.
  useEffect(() => {
    firstFocusRef.current?.focus();
  }, []);

  // Prevent body scroll while open.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-hidden="false"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.head}>
          <h3 id="modal-title" className={styles.title}>
            {title}
          </h3>
          <button
            ref={firstFocusRef}
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
