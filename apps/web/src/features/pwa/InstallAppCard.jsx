import { useEffect, useState } from 'react';
import styles from '../../pages/settings/SettingsPage.module.css';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);

// "Install app" section for Settings. Android/Chrome expose a real install
// prompt (beforeinstallprompt); iOS Safari has none, so we show the manual
// Share → Add to Home Screen steps instead.
export default function InstallAppCard() {
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Install app</h3>
      {installed ? (
        <p className={styles.hint}>Budget is installed on this device.</p>
      ) : installEvent ? (
        <>
          <p className={styles.hint}>
            Add Budget to your home screen to open it like a normal app, full screen.
          </p>
          <button className={styles.btnLogout} onClick={install} type="button">
            Install Budget
          </button>
        </>
      ) : isIos() ? (
        <p className={styles.hint}>
          In Safari, tap the Share button, then <b>Add to Home Screen</b>.
        </p>
      ) : (
        <p className={styles.hint}>
          Open your browser menu and choose <b>Install app</b> or{' '}
          <b>Add to Home screen</b>.
        </p>
      )}
    </section>
  );
}
