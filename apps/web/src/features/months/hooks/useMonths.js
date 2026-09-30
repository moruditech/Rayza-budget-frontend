import { useQuery } from '@tanstack/react-query';
import monthsService from '../../../services/months.service';
import { readCache, writeCache } from '../../../utils/offlineCache';

// Returns the summary list of all months for the user (newest first).
// Used by AppLayout to initialise activeMonthId and render the header label.
// The last result is kept on the device so the app can open with no signal.
export function useMonths() {
  return useQuery({
    queryKey: ['months'],
    queryFn: async () => {
      const months = await monthsService.listMonths();
      writeCache('months', months);
      return months;
    },
    initialData: () => readCache('months')?.data,
    initialDataUpdatedAt: () => readCache('months')?.savedAt,
  });
}
