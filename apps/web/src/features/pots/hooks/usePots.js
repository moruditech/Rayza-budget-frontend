import { useMutation, useQueryClient } from '@tanstack/react-query';
import potsService from '../../../services/pots.service';

// Shared invalidation: pot changes affect the full month detail (which
// embeds pots) and the summary list (totalBudgetLimit, unallocatedIncome).
function useInvalidate(monthId) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['month', monthId] });
    queryClient.invalidateQueries({ queryKey: ['months'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };
}

// FR-03 — create a pot.
export function useCreatePot(monthId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: (payload) => potsService.createPot(monthId, payload),
    onSuccess: invalidate,
  });
}

// FR-03 — update a pot's name, budgetLimit, colour, or order.
export function useUpdatePot(monthId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: ({ id, ...payload }) => potsService.updatePot(monthId, id, payload),
    onSuccess: invalidate,
  });
}

// FR-03 — delete a pot.
// Pass { id, force: true } to bypass the POT_HAS_HISTORY guard after
// the user confirms they want to delete a pot that has spend history.
export function useDeletePot(monthId) {
  const invalidate = useInvalidate(monthId);
  return useMutation({
    mutationFn: ({ id, force = false }) => potsService.deletePot(monthId, id, force),
    onSuccess: invalidate,
  });
}
