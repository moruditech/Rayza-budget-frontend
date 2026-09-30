import { useCallback, useEffect, useRef, useState } from 'react';
import { useLockStore } from '../../store/lockStore';
import { useLogoutMutation } from '../auth/hooks/useAuth';
import { verifyBiometric } from './biometric';
import Button from '../../components/ui/Button/Button';
import styles from './LockScreen.module.css';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function FingerprintIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M12 11v4a6 6 0 0 1-1 3M8 14a4 4 0 0 1 8 0v1a10 10 0 0 1-1 4M5 12a7 7 0 0 1 14 0v1c0 2-.3 3.5-1 5M3 10a9 9 0 0 1 18 0" />
    </svg>
  );
}

export default function LockScreen() {
  const config = useLockStore((s) => s.config);
  const verifyPin = useLockStore((s) => s.verifyPin);
  const unlock = useLockStore((s) => s.unlock);
  const attempts = useLockStore((s) => s.attempts);
  const logout = useLogoutMutation();

  const [pin, setPin] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [confirmLogout, setConfirmLogout] = useState(false);
  const triedBiometric = useRef(false);

  const waitLeft = Math.max(0, Math.ceil((attempts.until - now) / 1000));

  // Tick once a second while a pause is running.
  useEffect(() => {
    if (attempts.until <= Date.now()) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [attempts.until]);

  const tryBiometric = useCallback(async () => {
    if (!config?.credentialId) return;
    if (await verifyBiometric(config.credentialId)) unlock();
  }, [config, unlock]);

  // Offer the fingerprint prompt straight away when the lock appears.
  useEffect(() => {
    if (triedBiometric.current) return;
    triedBiometric.current = true;
    tryBiometric();
  }, [tryBiometric]);

  const submit = async (value) => {
    setBusy(true);
    const result = await verifyPin(value);
    setBusy(false);
    if (result.ok) return; // store unlocks; the screen disappears
    setPin('');
    setNow(Date.now());
    setMessage(
      result.waitSeconds > 0
        ? 'Too many wrong PINs. Please wait.'
        : `Wrong PIN. ${result.triesLeft} ${result.triesLeft === 1 ? 'try' : 'tries'} left before a pause.`
    );
  };

  const press = (digit) => {
    if (busy || waitLeft > 0) return;
    setMessage('');
    const next = pin + digit;
    setPin(next);
    if (next.length === config.pinLength) submit(next);
  };

  const length = config?.pinLength ?? 4;

  return (
    <div className={styles.screen} role="dialog" aria-modal="true" aria-label="App locked">
      <div className={styles.brand}>
        <svg viewBox="0 0 24 24" className={styles.logo} aria-hidden="true">
          <circle cx="9" cy="13" r="6" />
          <circle cx="15" cy="13" r="6" />
        </svg>
        <h1 className={styles.title}>Budget is locked</h1>
        <p className={styles.sub}>Enter your PIN to continue</p>
      </div>

      <div className={styles.dots} aria-label={`${pin.length} of ${length} digits entered`}>
        {Array.from({ length }).map((_, i) => (
          <span key={i} className={[styles.dot, i < pin.length ? styles.dotOn : ''].join(' ')} />
        ))}
      </div>

      <p className={styles.message} role="alert">
        {waitLeft > 0 ? `Try again in ${waitLeft}s` : message}
      </p>

      <div className={styles.pad}>
        {KEYS.map((k) => (
          <button key={k} className={styles.key} onClick={() => press(k)} type="button">
            {k}
          </button>
        ))}
        {config?.credentialId ? (
          <button
            className={[styles.key, styles.keyAlt].join(' ')}
            onClick={tryBiometric}
            type="button"
            aria-label="Unlock with fingerprint or face"
          >
            <FingerprintIcon />
          </button>
        ) : (
          <span />
        )}
        <button className={styles.key} onClick={() => press('0')} type="button">
          0
        </button>
        <button
          className={[styles.key, styles.keyAlt].join(' ')}
          onClick={() => {
            setPin((p) => p.slice(0, -1));
            setMessage('');
          }}
          type="button"
          aria-label="Delete last digit"
        >
          ⌫
        </button>
      </div>

      <button className={styles.forgot} onClick={() => setConfirmLogout(true)} type="button">
        Forgot PIN? Log out
      </button>

      {/* Drawn inside the lock screen: normal dialogs sit underneath it. */}
      {confirmLogout && (
        <div className={styles.confirm} role="alertdialog" aria-label="Log out">
          <div className={styles.confirmCard}>
            <h2 className={styles.confirmTitle}>Log out of Budget?</h2>
            <p className={styles.confirmText}>
              You will need your email and password to log back in, and the app
              lock will be turned off. Your budget data is saved on the server.{' '}
              <strong>Spends you logged offline that have not synced yet will be lost.</strong>
            </p>
            <Button className={styles.danger} onClick={() => logout.mutate()} loading={logout.isPending}>
              Log out
            </Button>
            <Button variant="ghost" onClick={() => setConfirmLogout(false)} disabled={logout.isPending}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
