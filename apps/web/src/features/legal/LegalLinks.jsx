import { Link } from 'react-router-dom';
import styles from './LegalPage.module.css';

// "Terms of Use · Privacy Policy · Cookie Policy" — shown on the login and
// sign-up screens, in Settings, and at the foot of each legal page.
export default function LegalLinks({ newTab = false }) {
  const props = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <nav className={styles.links} aria-label="Legal">
      <Link to="/terms" {...props}>Terms of Use</Link>
      <span aria-hidden="true">·</span>
      <Link to="/privacy" {...props}>Privacy Policy</Link>
      <span aria-hidden="true">·</span>
      <Link to="/cookies" {...props}>Cookie Policy</Link>
    </nav>
  );
}
