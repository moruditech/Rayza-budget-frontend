import { create } from 'zustand';

// FR-01 — stores the in-memory access token and authenticated state.
// The HttpOnly refresh cookie is managed entirely by the browser/API;
// we never touch it here.
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Called after a successful login or silent refresh.
  // `user` may be null in Phase 1 (no /me endpoint yet) — the token alone
  // is enough to protect routes and attach to API requests.
  login: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),

  // Called after a successful silent refresh (page reload).
  setToken: (accessToken) =>
    set({ accessToken, isAuthenticated: true }),

  // Called on logout or when the refresh token expires.
  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
}));
