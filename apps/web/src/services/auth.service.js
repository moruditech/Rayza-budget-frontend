import api from './api';

// FR-01 — register a new user. Returns { _id, name, email }.
async function register({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data.data;
}

// FR-01 — log in. Returns { accessToken }.
// The API also sets an HttpOnly refreshToken cookie automatically.
async function login({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
}

// FR-01 — exchange the refresh cookie for a new access token.
// Called by the Axios interceptor and by AuthInitializer on page load.
async function refresh() {
  const { data } = await api.post('/auth/refresh');
  return data.data;
}

// FR-01 — blacklist the current access token and clear the refresh cookie.
async function logout() {
  await api.post('/auth/logout');
}

// FR-01 — change the authenticated user's password.
async function changePassword({ currentPassword, newPassword }) {
  const { data } = await api.patch('/auth/password', {
    currentPassword,
    newPassword,
  });
  return data.data;
}

const authService = { register, login, refresh, logout, changePassword };
export default authService;
