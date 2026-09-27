import api from './api';

// FR-08 — list all months for the user, newest first.
async function listMonths() {
  const { data } = await api.get('/months');
  return data.data;
}

// FR-08 — get one month with full detail: income, pots, line items,
// all computed fields (spentAmount, surplus, progress, etc.).
async function getMonth(id) {
  const { data } = await api.get(`/months/${id}`);
  return data.data;
}

// FR-08 — create a new empty month.
async function createMonth({ year, month }) {
  const { data } = await api.post('/months', { year, month });
  return data.data;
}

// FR-08 — clone pot + line item structure into a new month.
async function cloneMonth(id, { year, month }) {
  const { data } = await api.post(`/months/${id}/clone`, { year, month });
  return data.data;
}

// FR-08 — lock a month permanently (computes and stores health score).
async function lockMonth(id) {
  const { data } = await api.patch(`/months/${id}/lock`);
  return data.data;
}

// FR-07 — submit rollover decisions for all pots with a surplus.
async function rollover(id, decisions) {
  const { data } = await api.post(`/months/${id}/rollover`, { decisions });
  return data.data;
}

const monthsService = {
  listMonths,
  getMonth,
  createMonth,
  cloneMonth,
  lockMonth,
  rollover,
};
export default monthsService;
