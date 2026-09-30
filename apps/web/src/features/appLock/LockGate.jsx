import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useLockStore } from '../../store/lockStore';
import LockScreen from './LockScreen';

// Wraps the whole app. Locks it the moment the app is hidden (switching apps,
// screen off, closing) so the app-switcher preview is covered too, and asks
// for the PIN / fingerprint when it comes back. The app underneath stays
// mounted, so nothing you were typing is lost.
export default function LockGate({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const enabled = useLockStore((s) => !!s.config);
  const locked = useLockStore((s) => s.locked);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return undefined;
    const onChange = () => {
      if (document.visibilityState === 'hidden') useLockStore.getState().lockNow();
    };
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, [enabled, isAuthenticated]);

  const showLock = enabled && isAuthenticated && locked;

  return (
    <>
      {/* `inert` stops taps, focus and screen readers from reaching the app behind the lock. */}
      <div style={{ display: 'contents' }} inert={showLock ? '' : undefined}>
        {children}
      </div>
      {showLock && <LockScreen />}
    </>
  );
}
