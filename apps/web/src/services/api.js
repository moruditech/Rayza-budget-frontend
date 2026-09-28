import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// ─── Axios instance ───────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials sends the HttpOnly refreshToken cookie on every request,
  // which is required for POST /auth/refresh to work. NFR-03.
  withCredentials: true,
});

// ─── Request interceptor — attach access token ────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Silent refresh state ─────────────────────────────────────────────────
// If multiple requests 401 simultaneously, only one refresh is made.
// All other callers queue here and retry once the new token arrives.
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
}

// If the in-flight refresh call itself fails, anyone queued behind it
// would otherwise wait on a promise that never resolves — reject them
// instead so their callers get a real (rejected) result back.
function onRefreshFailed(error) {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
}

function addRefreshSubscriber(resolve, reject) {
  refreshSubscribers.push({ resolve, reject });
}

// ─── Response interceptor — handle 401 → refresh → retry ─────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // True when the request that just 401'd *is* the refresh call itself —
    // e.g. AuthInitializer's silent refresh on page load with no (or an
    // expired) refresh cookie, which the API correctly answers with 401
    // "Refresh token is missing". Without this check, the branch below
    // would call POST /auth/refresh again to "refresh" the failed refresh
    // call. That second call 401s too, but by then isRefreshing is already
    // true, so it falls into the queueing branch and waits on a refresh
    // that will never succeed — hanging forever. Since AuthInitializer
    // awaits this same promise chain before flipping `ready` to true, the
    // whole app (including the login page) was left permanently blank for
    // anyone without a valid session. Treating a 401 on the refresh
    // endpoint as terminal — reject immediately, no retry — fixes that.
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    // Only attempt a refresh on 401, only once per request, and never for
    // the refresh call itself.
    if (error.response?.status !== 401 || original._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    // Queue this request until the in-flight refresh resolves, or reject
    // it if that refresh ends up failing.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        }, reject);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      // POST /auth/refresh — no body needed, the cookie does the work.
      const { data } = await api.post('/auth/refresh');
      const newToken = data.data.accessToken;

      useAuthStore.getState().setToken(newToken);
      onRefreshed(newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      // Refresh failed — session is truly expired. Force logout and make
      // sure anyone queued behind this refresh is rejected, not left
      // hanging.
      onRefreshFailed(refreshError);
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
