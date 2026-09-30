import { useQuery } from '@tanstack/react-query';
import monthsService from '../../../services/months.service';
import { readCache, writeCache } from '../../../utils/offlineCache';

// Returns the full month object: income[], pots[] (with lineItems[]),
// and all computed fields (spentAmount, surplus, progress, etc.).
// Disabled when monthId is falsy so the query does not fire before
// activeMonthId has been resolved by AppLayout.
// The last result is kept on the device so a month can still be viewed (and a
// spend logged) with no signal.
export function useMonth(monthId) {
  return useQuery({
    queryKey: ['month', monthId],
    queryFn: async () => {
      const month = await monthsService.getMonth(monthId);
      writeCache(`month.${monthId}`, month);
      return month;
    },
    enabled: !!monthId,
    initialData: () => (monthId ? readCache(`month.${monthId}`)?.data : undefined),
    initialDataUpdatedAt: () => (monthId ? readCache(`month.${monthId}`)?.savedAt : undefined),
  });
}
