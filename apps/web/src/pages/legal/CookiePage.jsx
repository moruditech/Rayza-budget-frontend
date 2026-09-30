import LegalPage, { Section } from '../../features/legal/LegalPage';
import { LEGAL } from '../../features/legal/legalConfig';
import styles from '../../features/legal/LegalPage.module.css';

// Cookie Policy. Lists exactly what the code stores (see authStore, lockStore,
// pendingStore, offlineCache, sw.js) — update it if any of those change.
export default function CookiePage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        This explains the cookies and similar storage {LEGAL.appName} uses on your device. We use
        only what is needed to run the app. There is no advertising, analytics or tracking.
      </p>

      <Section title="1. Cookie">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Name</th><th>What it does</th><th>Lasts</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code>refreshToken</code></td>
                <td>
                  Keeps you signed in. It is HttpOnly (scripts cannot read it), Secure,
                  SameSite=Strict, and only sent to our login endpoints.
                </td>
                <td>Up to 7 days, or until you log out</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          This cookie is strictly necessary: without it you would have to log in again every time.
          That is why there is no cookie banner with choices for it, and why blocking it stops
          login from working.
        </p>
      </Section>

      <Section title="2. Other storage on your device">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>Item</th><th>What it does</th></tr>
            </thead>
            <tbody>
              <tr><td><code>budget.hadSession</code></td><td>Remembers that you were signed in, so the app can open without signal.</td></tr>
              <tr><td><code>budget.cache.*</code></td><td>A copy of your recent months so you can view them offline.</td></tr>
              <tr><td><code>budget.pendingSpends</code></td><td>Spends you logged offline, waiting to be sent.</td></tr>
              <tr><td><code>budget.appLock</code>, <code>budget.appLockAttempts</code></td><td>Your app-lock settings: a salted hash of your PIN (not the PIN) and wrong-PIN counts.</td></tr>
              <tr><td>App files cache</td><td>The app&rsquo;s own pages and images, saved by the browser so it loads fast and works offline.</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          These stay on your device and are removed when you log out or delete the app&rsquo;s site
          data.
        </p>
      </Section>

      <Section title="3. Third parties">
        <p>
          The app loads its typefaces from Google Fonts. Your browser asks Google&rsquo;s servers
          for them, so Google receives your IP address and browser details. We do not add any
          advertising or analytics scripts.
        </p>
      </Section>

      <Section title="4. Managing this">
        <p>
          You can clear cookies and site data in your browser settings, or log out in Settings,
          which removes the items above. Blocking the cookie means you will not be able to stay
          signed in.
        </p>
        <p>
          More about how we treat your information is in the Privacy Policy.
        </p>
      </Section>

      <Section title="5. Changes">
        <p>
          If we start using other cookies or storage, we will update this page and ask you to
          accept the new version.
        </p>
      </Section>
    </LegalPage>
  );
}
