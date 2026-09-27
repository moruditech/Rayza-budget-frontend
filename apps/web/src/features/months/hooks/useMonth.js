import { useQuery } from '@tanstack/react-query';
import monthsService from '../../../services/months.service';

// Returns the full month object: income[], pots[] (with lineItems[]),
// and all computed fields (spentAmount, surplus, progress, etc.).
// Disabled when monthId is falsy so the query does not fire before
// activeMonthId has been resolved by AppLayout.
export function useMonth(monthId) {
  return useQuery({
    queryKey: ['month', monthId],
    queryFn: () => monthsService.getMonth(monthId),
    enabled: !!monthId,
  });
}
