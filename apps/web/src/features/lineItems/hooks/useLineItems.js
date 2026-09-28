import { useMutation, useQueryClient } from '@tanstack/react-query';
import lineItemsService from '../../../services/lineItems.service';

// Line item changes always invalidate the full month detail (pots embed
// lineItems) and the alerts (SINKING_FUND_READY and ALLOCATION alerts).
function useInvalidate(monthId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['month', monthId] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    // Withdrawals and transfers add entries to the Activity tab.
    queryClient.invalidateQueries({ queryKey: ['spendLog'] });
  };
}

// FR-04 — create a line item inside a pot.
export function useCreateLineItem(monthId, potId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (payload) =>
      lineItemsService.createLineItem(monthId, potId, payload),
    onSuccess: invalidate,
  });
}

// FR-04 — update a line item.
export function useUpdateLineItem(monthId, potId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      lineItemsService.updateLineItem(monthId, potId, id, payload),
    onSuccess: invalidate,
  });
}

// FR-04 — delete a line item.
export function useDeleteLineItem(monthId, potId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (id) => lineItemsService.deleteLineItem(monthId, potId, id),
    onSuccess: invalidate,
  });
}

// FR-06 — mark a sinking fund as used.
// Invalidates alerts because SINKING_FUND_READY may clear, and the month
// detail because accumulatedBalance resets.
export function useMarkUsed(monthId, potId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      lineItemsService.markUsed(monthId, potId, id, payload),
    onSuccess: invalidate,
  });
}

// Withdraw from a sinking fund at any time — reduces the balance and logs it.
export function useWithdraw(monthId, potId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      lineItemsService.withdraw(monthId, potId, id, payload),
    onSuccess: invalidate,
  });
}

// Move money between two sinking funds — one goes down, the other goes up.
export function useTransfer(monthId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (payload) => lineItemsService.transfer(monthId, payload),
    onSuccess: invalidate,
  });
}
