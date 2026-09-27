import { useMutation, useQueryClient } from '@tanstack/react-query';
import transactionsService from '../../../services/transactions.service';

// Transaction changes affect:
//   ['month', monthId]   — pot spentAmount / surplus are computed from SpendLog
//   ['spendLog']         — the activity tab list
//   ['alerts']           — pot-approaching-limit / stale-budget alerts may change
function useInvalidate(monthId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['month', monthId] });
    queryClient.invalidateQueries({ queryKey: ['spendLog'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };
}

// FR-05 — log a spend transaction against an INSTANT_SPEND line item.
export function useCreateTransaction(monthId, potId, lineItemId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (payload) =>
      transactionsService.createTransaction(monthId, potId, lineItemId, payload),
    onSuccess: invalidate,
  });
}

// FR-05 — update amount, note, or paymentMethod.
export function useUpdateTransaction(monthId, potId, lineItemId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      transactionsService.updateTransaction(monthId, potId, lineItemId, id, payload),
    onSuccess: invalidate,
  });
}

// FR-05 — delete a transaction.
export function useDeleteTransaction(monthId, potId, lineItemId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (id) =>
      transactionsService.deleteTransaction(monthId, potId, lineItemId, id),
    onSuccess: invalidate,
  });
}
