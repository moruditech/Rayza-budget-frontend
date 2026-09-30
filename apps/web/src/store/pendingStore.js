import { create } from 'zustand';

// Spends logged while offline, waiting to be sent to the server. Kept in
// localStorage so they survive closing the app. Each has a clientRequestId, so
// sending one twice can never create a duplicate on the server.
const KEY = 'budget.pendingSpends';

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore — the queue still works in memory for this session
  }
}

export const usePendingStore = create((set, get) => ({
  // { clientRequestId, monthId, potId, lineItemId, payload, createdAt, error }
  items: load(),

  add: (item) => {
    const items = [...get().items, { ...item, error: null }];
    persist(items);
    set({ items });
  },

  remove: (clientRequestId) => {
    const items = get().items.filter((i) => i.clientRequestId !== clientRequestId);
    persist(items);
    set({ items });
  },

  // The server said no (e.g. the month was locked): keep it, show why.
  markFailed: (clientRequestId, error) => {
    const items = get().items.map((i) =>
      i.clientRequestId === clientRequestId ? { ...i, error } : i
    );
    persist(items);
    set({ items });
  },

  // Try a failed one again.
  retry: (clientRequestId) => {
    const items = get().items.map((i) =>
      i.clientRequestId === clientRequestId ? { ...i, error: null } : i
    );
    persist(items);
    set({ items });
  },

  clear: () => {
    persist([]);
    set({ items: [] });
  },
}));
