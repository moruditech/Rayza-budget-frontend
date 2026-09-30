import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import authService from '../../services/auth.service';
import { useAuthStore, clearLocalUserData } from '../../store/authStore';
import { useMe } from '../legal/useMe';
import LegalLinks from '../legal/LegalLinks';
import Modal from '../../components/ui/Modal/Modal';
import Input from '../../components/ui/Input/Input';
import Button from '../../components/ui/Button/Button';
import Alert from '../../components/ui/Alert/Alert';
import { downloadBlob } from '../../utils/monthExport';
import styles from '../../pages/settings/SettingsPage.module.css';
import local from './PrivacyDataCard.module.css';

function DeleteAccountModal({ onClose }) {
  const logout = useAuthStore((s) => s.logout);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => authService.deleteAccount(password),
    onSuccess: () => {
      logout();
      clearLocalUserData();
      window.location.href = '/login';
    },
    onError: (err) => {
      const code = err.response?.data?.error?.code;
      setError(
        code === 'INVALID_CREDENTIALS'
          ? 'Password is incorrect.'
          : code === 'RATE_LIMITED'
            ? 'Too many attempts. Try again later.'
            : 'Something went wrong. Please try again.'
      );
    },
  });

  return (
    <Modal title="Delete my account" onClose={mutation.isPending ? () => {} : onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          mutation.mutate();
        }}
        style={{ display: 'grid', gap: 12 }}
      >
        {error && <Alert variant="warn">{error}</Alert>}
        <Alert variant="warn">All your data will be deleted for good.</Alert>
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className={local.danger} type="submit" loading={mutation.isPending} disabled={!password}>
          Delete my account
        </Button>
      </form>
    </Modal>
  );
}

// Settings → Privacy: legal documents, the right to a copy of your data, and
// the right to have it deleted (POPIA ss. 23 and 24).
export default function PrivacyDataCard() {
  const { data: me } = useMe();
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState('');

  const download = useMutation({
    mutationFn: authService.exportData,
    onSuccess: (data) => {
      const date = new Date().toISOString().slice(0, 10);
      downloadBlob(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
        `budget-data-${date}.json`
      );
    },
    onError: () => setError('Could not download your data. Please try again.'),
  });

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Privacy</h3>

      <LegalLinks />
      {me?.consentAt && (
        <p className={styles.hint}>
          Accepted {new Date(me.consentAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}

      {error && <Alert variant="warn">{error}</Alert>}

      <div className={local.actions}>
        <button
          className={styles.btnLogout}
          onClick={() => {
            setError('');
            download.mutate();
          }}
          disabled={download.isPending}
          type="button"
        >
          {download.isPending ? 'Preparing…' : 'Download my data'}
        </button>
        <button className={styles.btnLogout} onClick={() => setShowDelete(true)} type="button">
          Delete my account
        </button>
      </div>

      {showDelete && <DeleteAccountModal onClose={() => setShowDelete(false)} />}
    </section>
  );
}
