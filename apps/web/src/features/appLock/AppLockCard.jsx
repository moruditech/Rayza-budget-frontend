import { useEffect, useState } from 'react';
import { useLockStore } from '../../store/lockStore';
import { biometricSupported, registerBiometric } from './biometric';
import { isValidPin } from './lockCrypto';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import Alert from '../../components/ui/Alert/Alert';
import styles from '../../pages/settings/SettingsPage.module.css';

// ── Turn the lock on ────────────────────────────────────────────────────
function SetupModal({ canUseBiometric, onClose }) {
  const enable = useLockStore((s) => s.enable);
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [useBio, setUseBio] = useState(canUseBiometric);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidPin(pin)) return setError('Use 4 to 6 digits.');
    if (pin !== confirm) return setError('The two PINs do not match.');
    setBusy(true);
    setError('');
    try {
      let credentialId = null;
      if (useBio) {
        try {
          credentialId = await registerBiometric();
        } catch {
          // Cancelled or refused: keep going with the PIN only.
          setError('');
        }
      }
      await enable(pin, credentialId);
      onClose();
    } catch {
      setError('Could not turn the lock on. Please try again.');
      setBusy(false);
    }
  };

  return (
    <Modal title="Turn on app lock" onClose={busy ? () => {} : onClose}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        {error && <Alert variant="warn">{error}</Alert>}
        <Input
          label="New PIN"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        />
        <Input
          label="Repeat PIN"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))}
        />
        {canUseBiometric && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.88rem' }}>
            <input type="checkbox" checked={useBio} onChange={(e) => setUseBio(e.target.checked)} />
            <span>Also unlock with fingerprint / face</span>
          </label>
        )}
        <Button type="submit" loading={busy}>
          Turn on
        </Button>
      </form>
    </Modal>
  );
}

// ── Change the PIN ──────────────────────────────────────────────────────
function ChangePinModal({ onClose }) {
  const verifyPin = useLockStore((s) => s.verifyPin);
  const changePin = useLockStore((s) => s.changePin);
  const [current, setCurrent] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidPin(pin)) return setError('The new PIN must be 4 to 6 digits.');
    if (pin !== confirm) return setError('The two new PINs do not match.');
    setBusy(true);
    const check = await verifyPin(current);
    if (!check.ok) {
      setBusy(false);
      return setError(
        check.waitSeconds > 0 ? `Too many wrong tries. Wait ${check.waitSeconds}s.` : 'Current PIN is wrong.'
      );
    }
    await changePin(pin);
    return onClose();
  };

  return (
    <Modal title="Change PIN" onClose={busy ? () => {} : onClose}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        {error && <Alert variant="warn">{error}</Alert>}
        <Input label="Current PIN" type="password" inputMode="numeric" autoComplete="off" maxLength={6}
          value={current} onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ''))} />
        <Input label="New PIN" type="password" inputMode="numeric" autoComplete="off" maxLength={6}
          value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
        <Input label="Repeat new PIN" type="password" inputMode="numeric" autoComplete="off" maxLength={6}
          value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))} />
        <Button type="submit" loading={busy}>Change PIN</Button>
      </form>
    </Modal>
  );
}

// ── Turn the lock off (needs the PIN) ───────────────────────────────────
function DisableModal({ onClose }) {
  const verifyPin = useLockStore((s) => s.verifyPin);
  const disable = useLockStore((s) => s.disable);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const check = await verifyPin(pin);
    if (!check.ok) {
      setBusy(false);
      return setError(
        check.waitSeconds > 0 ? `Too many wrong tries. Wait ${check.waitSeconds}s.` : 'That PIN is wrong.'
      );
    }
    disable();
    return onClose();
  };

  return (
    <Modal title="Turn off app lock" onClose={busy ? () => {} : onClose}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        {error && <Alert variant="warn">{error}</Alert>}
        <Input label="PIN" type="password" inputMode="numeric" autoComplete="off" maxLength={6}
          value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
        <Button type="submit" loading={busy}>Turn off</Button>
      </form>
    </Modal>
  );
}

// ── Settings section ────────────────────────────────────────────────────
export default function AppLockCard() {
  const config = useLockStore((s) => s.config);
  const setCredential = useLockStore((s) => s.setCredential);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [modal, setModal] = useState(null); // 'setup' | 'change' | 'disable'
  const [bioError, setBioError] = useState('');

  useEffect(() => {
    biometricSupported().then(setBioAvailable);
  }, []);

  const toggleBiometric = async () => {
    setBioError('');
    if (config.credentialId) {
      setCredential(null);
      return;
    }
    try {
      setCredential(await registerBiometric());
    } catch {
      setBioError('Could not set up fingerprint / face unlock on this phone.');
    }
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>App lock</h3>

      {!config ? (
        <>
          <button className={styles.btnLogout} onClick={() => setModal('setup')} type="button">
            Turn on app lock
          </button>
        </>
      ) : (
        <>
          <p className={styles.hint}>App lock is on</p>
          {bioError && <Alert variant="warn">{bioError}</Alert>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {bioAvailable && (
              <button className={styles.btnLogout} onClick={toggleBiometric} type="button">
                {config.credentialId ? 'Turn off fingerprint / face' : 'Use fingerprint / face'}
              </button>
            )}
            <button className={styles.btnLogout} onClick={() => setModal('change')} type="button">
              Change PIN
            </button>
            <button className={styles.btnLogout} onClick={() => setModal('disable')} type="button">
              Turn off
            </button>
          </div>
        </>
      )}

      {modal === 'setup' && <SetupModal canUseBiometric={bioAvailable} onClose={() => setModal(null)} />}
      {modal === 'change' && <ChangePinModal onClose={() => setModal(null)} />}
      {modal === 'disable' && <DisableModal onClose={() => setModal(null)} />}
    </section>
  );
}
