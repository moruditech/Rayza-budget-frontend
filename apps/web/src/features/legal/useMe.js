import { useQuery } from '@tanstack/react-query';
import authService from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

// The signed-in person's details, including whether they still need to accept
// the current Terms / Privacy Policy.
export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
}
