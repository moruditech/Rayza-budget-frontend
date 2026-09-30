import InstallAppCard from '../../features/pwa/InstallAppCard';
import AppLockCard from '../../features/appLock/AppLockCard';
import ChangePasswordForm from '../../features/auth/components/ChangePasswordForm';
import { useLogoutMutation } from '../../features/auth/hooks/useAuth';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const logoutMutation = useLogoutMutation();

  return (
    <>
      {/* Install as a phone app (PWA) */}
      <InstallAppCard />

      {/* PIN / fingerprint lock for this device */}
      <AppLockCard />

      {/* Change password */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Change password</h3>
        <ChangePasswordForm />
      </section>

      {/* Account */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Account</h3>
        <p className={styles.hint}>
          Logging out clears your session. Your data is saved and you can log
          back in at any time.
        </p>
        <button
          className={styles.btnLogout}
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          type="button"
        >
          {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
        </button>
      </section>
    </>
  );
}
