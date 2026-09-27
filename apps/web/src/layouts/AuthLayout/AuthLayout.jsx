import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

// The SVG pots icon matches the brand mark used in the main app header.
function PotsIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="13" r="6" />
      <circle cx="15" cy="13" r="6" />
    </svg>
  );
}

export default function AuthLayout() {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>
            <PotsIcon />
          </span>
          <span className={styles.brandName}>Budget</span>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
