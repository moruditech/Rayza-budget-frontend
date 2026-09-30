import { create } from 'zustand';

// Undo for deletes. Deleting something hides it straight away, but the request
// to the server is held back for a few seconds. "Undo" just cancels that
// request, so nothing has to be restored. Leaving the app sends it at once.
export const UNDO_DELAY_MS = 6000;

const without = (obj, key) => {
  const { [key]: _removed, ...rest } = obj;
  return rest;
};

export const useUndoStore = create((set, get) => ({
  pending: [], // { key, label, commit, timer } — waiting out the undo window
  hidden: {},  // key -> true, for pending AND already-deleted items
  notices: [], // { id, text } — a delete that failed and was restored

  // key: 'lineItem:<id>' | 'pot:<id>' | 'txn:<id>' | 'income:<id>'
  // commit: () => Promise — performs the real delete
  schedule({ key, label, commit }) {
    if (get().hidden[key]) return;
    const timer = setTimeout(() => get().commitNow(key), UNDO_DELAY_MS);
    set((s) => ({
      pending: [...s.pending, { key, label, commit, timer }],
      hidden: { ...s.hidden, [key]: true },
    }));
  },

  undo(key) {
    const entry = get().pending.find((p) => p.key === key);
    if (!entry) return;
    clearTimeout(entry.timer);
    set((s) => ({
      pending: s.pending.filter((p) => p.key !== key),
      hidden: without(s.hidden, key),
    }));
  },

  async commitNow(key) {
    const entry = get().pending.find((p) => p.key === key);
    if (!entry) return;
    clearTimeout(entry.timer);
    set((s) => ({ pending: s.pending.filter((p) => p.key !== key) }));
    try {
      await entry.commit();
      // Stays hidden: the list refetch may take a moment and must not flash it back.
    } catch {
      set((s) => ({
        hidden: without(s.hidden, key),
        notices: [...s.notices, { id: `${key}-${Date.now()}`, text: `Could not delete ${entry.label.replace(/ (deleted|removed)$/, '')}` }],
      }));
    }
  },

  flushAll() {
    get().pending.forEach((p) => get().commitNow(p.key));
  },

  dismissNotice(id) {
    set((s) => ({ notices: s.notices.filter((n) => n.id !== id) }));
  },
}));
