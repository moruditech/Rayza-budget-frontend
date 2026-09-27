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
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

// ─── Response interceptor — handle 401 → refresh → retry ─────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only attempt a refresh on 401 and only once per request.
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Queue this request until the in-flight refresh resolves.
    if (isRefreshing) {
      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
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
      // Refresh failed — session is truly expired. Force logout.
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
