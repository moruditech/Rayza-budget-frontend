import api from './api';

// FR-01 — register a new user. Returns { _id, name, email }.
async function register({ name, email, password, acceptTerms }) {
  const { data } = await api.post('/auth/register', { name, email, password, acceptTerms });
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

// Sends a reset link if the email has an account. The answer is always the same.
async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

// Sets a new password from the link in the email.
async function resetPassword({ token, password }) {
  await api.post('/auth/reset-password', { token, password });
}

// The signed-in person, including whether they must accept the current terms.
async function me() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

// Accept the current Terms of Use / Privacy Policy.
async function acceptConsent() {
  const { data } = await api.post('/auth/consent', { accept: true });
  return data.data;
}

// Everything the app holds about the signed-in person (JSON).
async function exportData() {
  const { data } = await api.get('/account/export');
  return data.data;
}

// Permanently deletes the account and all its data.
async function deleteAccount(password) {
  await api.delete('/account', { data: { password } });
}

const authService = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  me,
  acceptConsent,
  exportData,
  deleteAccount,
};
export default authService;
