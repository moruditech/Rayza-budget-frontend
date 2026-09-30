import { Link, useNavigate } from 'react-router-dom';
import { LEGAL } from './legalConfig';
import LegalLinks from './LegalLinks';
import styles from './LegalPage.module.css';

// A value from legalConfig.js. Placeholders (still in [brackets]) are
// highlighted so nobody publishes the page without filling them in; real
// email addresses become links.
export function Field({ value }) {
  if (typeof value === 'string' && value.startsWith('[')) {
    return <mark className={styles.placeholder}>{value}</mark>;
  }
  if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return <a href={`mailto:${value}`}>{value}</a>;
  }
  return <>{value}</>;
}

export function Section({ title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>{title}</h2>
      {children}
    </section>
  );
}

// Shared shell for the Terms, Privacy and Cookie pages. Public: works when
// logged out (from the sign-up form) and when logged in (from Settings).
export default function LegalPage({ title, children }) {
  const navigate = useNavigate();
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button className={styles.back} onClick={goBack} type="button">
          ← Back
        </button>
        <Link to="/" className={styles.brand}>
          {LEGAL.appName}
        </Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.h1}>{title}</h1>
        <p className={styles.meta}>
          Last updated {LEGAL.lastUpdated} · Version {LEGAL.version}
        </p>
        {children}
      </main>

      <footer className={styles.footer}>
        <LegalLinks />
      </footer>
    </div>
  );
}
