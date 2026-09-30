import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../../services/auth.service';
import { useAuthStore, clearLocalUserData } from '../../../store/authStore';

// FR-01 — register mutation. On success navigates to /login with a flag
// so the login page can show a "registration successful" message.
export function useRegisterMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      navigate('/login', { state: { registered: true } });
    },
  });
}

// FR-01 — login mutation. On success hydrates the auth store and redirects
// the user back to the page they were trying to reach.
export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ accessToken }) => {
      // No /me endpoint yet — user object is null until Phase 5.
      login(null, accessToken);
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    },
  });
}

// FR-01 — logout mutation. Clears the store and hard-navigates to /login
// so all in-memory state (query cache, store) is reset cleanly.
export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // onSettled runs on both success and error — if the API call fails
      // (e.g. token already expired), we still want to clear the client.
      logout();
      clearLocalUserData();
      window.location.href = '/login';
    },
  });
}

// Ask for a password-reset email. The answer is the same whether or not the
// address has an account, so the form just shows it.
export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: (email) => authService.forgotPassword(email) });
}

// Set a new password from the emailed link, then go to login.
export function useResetPasswordMutation() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => navigate('/login', { replace: true, state: { passwordReset: true } }),
  });
}
