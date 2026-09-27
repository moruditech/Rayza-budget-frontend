import api from './api';

// FR-10 — fetch spend log entries with optional filters and pagination.
// Returns { entries, meta } so the caller can read both the list and the
// pagination state (page, limit, total) from a single result object.
async function getSpendLog(params = {}) {
  // Strip undefined values so they are not sent as empty query params.
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const { data } = await api.get('/spend-log', { params: clean });
  return { entries: data.data, meta: data.meta };
}

const spendLogService = { getSpendLog };
export default spendLogService;
