import api from './api';

// FR-03 — get all pots for a month (without line items).
// Note: the full month detail from GET /months/:id already embeds pots
// with lineItems, so PotsPage reads from useMonth() instead. This service
// is kept for completeness and future use.
async function listPots(monthId) {
  const { data } = await api.get(`/months/${monthId}/pots`);
  return data.data;
}

// FR-03 — create a pot.
async function createPot(monthId, payload) {
  const { data } = await api.post(`/months/${monthId}/pots`, payload);
  return data.data;
}

// FR-03 — update a pot (name, budgetLimit, colour, order — all optional).
async function updatePot(monthId, id, payload) {
  const { data } = await api.patch(`/months/${monthId}/pots/${id}`, payload);
  return data.data;
}

// FR-03 — delete a pot. Pass force=true to bypass the POT_HAS_HISTORY guard.
// The API sends force in the request body for DELETE requests.
async function deletePot(monthId, id, force = false) {
  const { data } = await api.delete(`/months/${monthId}/pots/${id}`, {
    data: force ? { force: true } : undefined,
  });
  return data.data;
}

const potsService = { listPots, createPot, updatePot, deletePot };
export default potsService;
