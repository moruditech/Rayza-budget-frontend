import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../../services/auth.service';
import { useLogoutMutation } from '../auth/hooks/useAuth';
import { useMe } from './useMe';
import LegalLinks from './LegalLinks';
import Button from '../../components/ui/Button/Button';
import Alert from '../../components/ui/Alert/Alert';
import styles from './ConsentGate.module.css';

// Covers the app until the person has accepted the CURRENT Terms of Use and
// Privacy Policy. Shown to people who registered before those existed, and to
// everyone again whenever LEGAL_VERSION is bumped.
export default function ConsentGate() {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const logout = useLogoutMutation();
  const [ticked, setTicked] = useState(false);

  const accept = useMutation({
    mutationFn: authService.acceptConsent,
    onSuccess: (updated) => queryClient.setQueryData(['me'], updated),
  });

  if (!me?.consentRequired) return null;

  return (
    <div className={styles.screen} role="dialog" aria-modal="true" aria-label="Terms and privacy">
      <div className={styles.card}>
        <h1 className={styles.title}>Terms and Privacy</h1>

        {accept.isError && <Alert variant="warn">Something went wrong. Please try again.</Alert>}

        <label className={styles.check}>
          <input type="checkbox" checked={ticked} onChange={(e) => setTicked(e.target.checked)} />
          <span>I am 18 or older and accept the terms below</span>
        </label>
        <LegalLinks newTab />

        <Button onClick={() => accept.mutate()} disabled={!ticked} loading={accept.isPending}>
          Continue
        </Button>
        <button className={styles.logout} onClick={() => logout.mutate()} type="button">
          Log out
        </button>
      </div>
    </div>
  );
}
