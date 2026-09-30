// Sends queued offline spends to the server, oldest first. Kept free of React
// and of the API client (both are passed in) so the rules can be tested alone.

let inFlight = false;

export function describeSyncError(err) {
  const code = err?.response?.data?.error?.code;
  if (code === 'MONTH_LOCKED') return 'That month is locked now';
  if (code === 'NOT_FOUND') return 'The item or pot no longer exists';
  if (code === 'WRONG_TYPE') return 'That item can no longer take spending';
  return 'The server rejected this spend';
}

// A problem that will go away by itself (no signal, server down, session
// refreshing) — leave the spend queued and try again later.
export function isTemporary(err) {
  const status = err?.response?.status;
  return !err?.response || status >= 500 || status === 401 || status === 429;
}

/**
 * deps: { getItems, send(item), onSynced(item), onFailed(item, message) }
 * Returns how many spends were sent. Stops at the first temporary problem so
 * order is kept; a permanent rejection only marks that one spend as failed.
 */
export async function syncPendingSpends(deps) {
  if (inFlight) return { synced: 0, skipped: true };
  inFlight = true;
  try {
    let synced = 0;
    const queue = deps.getItems().filter((item) => !item.error);
    for (const item of queue) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deps.send(item);
        deps.onSynced(item);
        synced += 1;
      } catch (err) {
        if (isTemporary(err)) break;
        deps.onFailed(item, describeSyncError(err));
      }
    }
    return { synced, skipped: false };
  } finally {
    inFlight = false;
  }
}
