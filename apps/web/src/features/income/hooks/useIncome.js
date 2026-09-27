import { useMutation, useQueryClient } from '@tanstack/react-query';
import incomeService from '../../../services/income.service';

// Shared invalidation: income changes affect the full month detail (income
// is embedded there), the summary list (totalIncome changes), and alerts
// (unallocated income alert may appear/clear).
function useInvalidate(monthId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['month', monthId] });
    queryClient.invalidateQueries({ queryKey: ['months'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };
}

// FR-02 — add an income source.
export function useCreateIncome(monthId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (payload) => incomeService.createIncome(monthId, payload),
    onSuccess: invalidate,
  });
}

// FR-02 — update label or amount on an existing income source.
// Called on blur from the inline-editable income rows.
export function useUpdateIncome(monthId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      incomeService.updateIncome(monthId, id, payload),
    onSuccess: invalidate,
  });
}

// FR-02 — delete an income source.
export function useDeleteIncome(monthId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (id) => incomeService.deleteIncome(monthId, id),
    onSuccess: invalidate,
  });
}
