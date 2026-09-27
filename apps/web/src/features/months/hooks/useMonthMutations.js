import { useMutation, useQueryClient } from '@tanstack/react-query';
import monthsService from '../../../services/months.service';

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
