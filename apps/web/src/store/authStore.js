import { create } from 'zustand';
import { clearCache } from '../utils/offlineCache';
import { usePendingStore } from './pendingStore';
import { useLockStore } from './lockStore';

// FR-01 — stores the in-memory access token and authenticated state.
// The HttpOnly refresh cookie is managed entirely by the browser/API;
// we never touch it here.

// Remembers that this device had a signed-in session, so the app can still
// open with no signal (the silent refresh needs the network). It holds no
// token or data — only "yes, someone was signed in here".
const SESSION_FLAG = 'budget.hadSession';

export function hasRememberedSession() {
  try {
    return localStorage.getItem(SESSION_FLAG) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(on) {
  try {
    if (on) localStorage.setItem(SESSION_FLAG, '1');
    else localStorage.removeItem(SESSION_FLAG);
  } catch {
    // ignore
  }
}

// Wipes everything this app keeps on the device for the signed-in person:
// saved months, spends waiting to sync, and the app lock. Used on a deliberate
// log out.
export function clearLocalUserData() {
  clearCache();
  usePendingStore.getState().clear();
  useLockStore.getState().reset();
}

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Called after a successful login or silent refresh.
  // `user` may be null in Phase 1 (no /me endpoint yet) — the token alone
  // is enough to protect routes and attach to API requests.
  login: (user, accessToken) => {
    setSessionFlag(true);
    // Just typed the password: no need to ask for the app PIN straight away.
    useLockStore.getState().unlock();
    set({ user, accessToken, isAuthenticated: true });
  },

  // Called after a successful silent refresh (page reload).
  setToken: (accessToken) => {
    setSessionFlag(true);
    set({ accessToken, isAuthenticated: true });
  },

  // Opening the app with no signal: the silent refresh could not run, but this
  // device had a session. Let the person in with their saved data; the next
  // request after signal returns refreshes the token by itself.
  enterOfflineMode: () => set({ isAuthenticated: true }),

  // Called on logout or when the refresh token expires.
  logout: () => {
    setSessionFlag(false);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
