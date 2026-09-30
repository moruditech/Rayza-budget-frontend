import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { router } from './router/index';
import { useAuthStore, hasRememberedSession } from './store/authStore';
import LockGate from './features/appLock/LockGate';
import authService from './services/auth.service';

import './styles/global.css';

// ─── TanStack Query client ─────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on 4xx errors — these are deterministic failures.
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      staleTime: 30_000, // 30 s before a query is considered stale
    },
  },
});

// ─── Auth initializer ──────────────────────────────────────────────────────
// On every page load, attempt a silent token refresh using the HttpOnly
// cookie. This keeps the user logged in across page reloads without
// storing the access token in localStorage. The app renders only after
// hydration resolves so AuthGuard always sees the correct auth state.
function AuthInitializer({ children }) {
  const [ready, setReady] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const logout   = useAuthStore((s) => s.logout);
  const enterOfflineMode = useAuthStore((s) => s.enterOfflineMode);

  useEffect(() => {
    authService
      .refresh()
      .then(({ accessToken }) => setToken(accessToken))
      .catch((err) => {
        // No answer at all (no signal) on a device that had a session: open
        // the app with saved data instead of throwing the person to login.
        if (!err?.response && hasRememberedSession()) enterOfflineMode();
        else logout(); // No valid cookie — user must log in.
      })
      .finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render nothing while we wait for the refresh check.
  // The background colour is set on <body> via global.css, so the
  // screen stays the correct colour without a visible flash.
  if (!ready) return null;

  return children;
}

// ─── PWA service worker ────────────────────────────────────────────────────
// Production only: in dev it would cache stale modules and fight Vite's HMR.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Not fatal — the app simply won't be installable/offline-capable.
    });
  });
}

// ─── Mount ─────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <LockGate>
          <RouterProvider router={router} />
        </LockGate>
      </AuthInitializer>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
