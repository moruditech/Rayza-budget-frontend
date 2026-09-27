import { useInfiniteQuery } from '@tanstack/react-query';
import spendLogService from '../../../services/spendLog.service';

const PAGE_LIMIT = 20;

// FR-10 — paginated spend log. Uses useInfiniteQuery so the Activity tab
// can append more entries with a "Load more" button without losing the
// entries already on screen.
//
// `filters` is an object of optional query params:
//   monthId, potId, lineItemId, type, paymentMethod, from, to
//
// Returns the standard useInfiniteQuery result. Callers flatten pages:
//   const entries = data?.pages.flatMap(p => p.entries) ?? []
export function useSpendLog(filters = {}) {
  return useInfiniteQuery({
    // Include filters in the query key so changing a filter triggers a fresh fetch.
    queryKey: ['spendLog', filters],
    queryFn: ({ pageParam }) =>
      spendLogService.getSpendLog({
        ...filters,
        page:  pageParam,
        limit: PAGE_LIMIT,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      const { page, limit, total } = lastPage.meta;
      const hasMore = page * limit < total;
      return hasMore ? page + 1 : undefined;
    },
    staleTime: 15_000,
  });
}
