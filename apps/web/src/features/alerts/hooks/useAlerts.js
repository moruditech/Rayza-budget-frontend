import { useQuery } from '@tanstack/react-query';
import alertsService from '../../../services/alerts.service';

// FR-13 — fetches all active alerts for the current calendar month.
// Kept fresher than most queries (10 s stale time) and re-checked whenever
// the user returns to the tab, mirroring the "poll on page load and after
// every transaction" strategy from the backend architecture document.
export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: alertsService.getAlerts,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}
