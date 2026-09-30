import { useMutation, useQueryClient } from '@tanstack/react-query';
import transactionsService from '../../../services/transactions.service';
import { usePendingStore } from '../../../store/pendingStore';

// Unique id for one logged spend. The server uses it to recognise a retry of
// the same spend, so it is never counted twice.
function newRequestId() {
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

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
//
// Works with no signal: when the request cannot reach the server, the spend is
// saved on the phone and sent later (see features/offline). The mutation then
// resolves with { queued: true } so the form closes as if it had worked.
export function useCreateTransaction(monthId, potId, lineItemId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    // 'always' = try the request even when the browser thinks it is offline,
    // instead of pausing it. A failed attempt is then queued below.
    networkMode: 'always',
    mutationFn: async (payload) => {
      const clientRequestId = newRequestId();
      try {
        // A 15 s limit so a dead connection queues the spend instead of hanging.
        return await transactionsService.createTransaction(
          monthId,
          potId,
          lineItemId,
          { ...payload, clientRequestId },
          { timeout: 15_000 }
        );
      } catch (err) {
        if (err?.response) throw err; // the server answered: a real error
        usePendingStore.getState().add({
          clientRequestId,
          monthId,
          potId,
          lineItemId,
          payload,
          createdAt: new Date().toISOString(),
        });
        return { queued: true };
      }
    },
    onSuccess: (data) => {
      if (!data?.queued) invalidate();
    },
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
