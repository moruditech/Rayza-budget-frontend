import { useQuery } from '@tanstack/react-query';
import monthsService from '../../../services/months.service';

// Returns the summary list of all months for the user (newest first).
// Used by AppLayout to initialise activeMonthId and render the header label.
export function useMonths() {
  return useQuery({
    queryKey: ['months'],
    queryFn: monthsService.listMonths,
  });
}
