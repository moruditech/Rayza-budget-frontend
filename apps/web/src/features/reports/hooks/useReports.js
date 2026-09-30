import { useQuery } from '@tanstack/react-query';
import reportsService from '../../../services/reports.service';

// FR-14 — income vs spend trend. Stale after 2 minutes; report data
// changes only when transactions are logged or months are locked.
export function useIncomeVsSpend(months = 6) {
  return useQuery({
    queryKey: ['reports', 'income-vs-spend', months],
    queryFn:  () => reportsService.getIncomeVsSpend(months),
    staleTime: 120_000,
  });
}

// FR-14 — spending per pot. Requires a monthId; disabled without one.
export function useSpendingByPot(monthId) {
  return useQuery({
    queryKey: ['reports', 'spending-by-pot', monthId],
    queryFn:  () => reportsService.getSpendingByPot(monthId),
    enabled:  !!monthId,
    staleTime: 120_000,
  });
}

// FR-14 — sinking fund balance over time.
export function useSinkingFundProgress(months = 6) {
  return useQuery({
    queryKey: ['reports', 'sinking-fund-progress', months],
    queryFn:  () => reportsService.getSinkingFundProgress(months),
    staleTime: 120_000,
  });
}

// FR-14 — health score history over locked months.
export function useHealthHistory(months = 6) {
  return useQuery({
    queryKey: ['reports', 'health-history', months],
    queryFn:  () => reportsService.getHealthHistory(months),
    staleTime: 120_000,
  });
}

// FR-14 — category breakdown (SPENDING / SAVING / INVESTMENT) for a month.
export function useCategoryBreakdown(monthId) {
  return useQuery({
    queryKey: ['reports', 'category-breakdown', monthId],
    queryFn:  () => reportsService.getCategoryBreakdown(monthId),
    enabled:  !!monthId,
    staleTime: 120_000,
  });
}

// Pot-by-pot comparison with the previous month. Requires a monthId.
export function usePotComparison(monthId) {
  return useQuery({
    queryKey: ['reports', 'pot-comparison', monthId],
    queryFn:  () => reportsService.getPotComparison(monthId),
    enabled:  !!monthId,
    staleTime: 120_000,
  });
}
