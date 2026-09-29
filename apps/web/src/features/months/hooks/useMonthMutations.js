import { useMutation, useQueryClient } from '@tanstack/react-query';
import monthsService from '../../../services/months.service';
import { useMonthStore } from '../../../store/monthStore';

// FR-08 — create a new empty month.
export function useCreateMonth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => monthsService.createMonth(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['months'] });
    },
  });
}

// FR-08 — clone a month's pot + line item structure into a new month.
export function useCloneMonth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => monthsService.cloneMonth(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['months'] });
    },
  });
}

// FR-07 — submit rollover decisions (RESET / ROLLOVER / SWEEP) for pots
// with a surplus. Called before locking; does not invalidate because the
// lock mutation that immediately follows will do so.
export function useRollover() {
  return useMutation({
    mutationFn: ({ id, decisions }) => monthsService.rollover(id, decisions),
  });
}

// FR-08 — lock a month permanently. Computes and stores the health score.
export function useLockMonth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => monthsService.lockMonth(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['month', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

// Delete a month and everything in it. The deleted month is dropped from the
// cached list straight away, and if it was the selected month the selection is
// cleared so AppLayout picks the current (or newest) remaining month.
export function useDeleteMonth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => monthsService.deleteMonth(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData(['months'], (old) =>
        Array.isArray(old) ? old.filter((m) => m._id !== id) : old
      );
      queryClient.removeQueries({ queryKey: ['month', id] });
      queryClient.invalidateQueries({ queryKey: ['months'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['spendLog'] });

      const { activeMonthId, setActiveMonth } = useMonthStore.getState();
      if (activeMonthId === id) setActiveMonth(null);
    },
  });
}
