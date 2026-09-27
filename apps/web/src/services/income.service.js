import api from './api';

// FR-02 — list all income sources for a month.
async function listIncome(monthId) {
  const { data } = await api.get(`/months/${monthId}/income`);
  return data.data;
}

// FR-02 — add an income source to a month.
async function createIncome(monthId, payload) {
  const { data } = await api.post(`/months/${monthId}/income`, payload);
  return data.data;
}

// FR-02 — update an income source (label or amount).
async function updateIncome(monthId, id, payload) {
  const { data } = await api.patch(`/months/${monthId}/income/${id}`, payload);
  return data.data;
}

// FR-02 — delete an income source.
// The API blocks this if the remaining income would fall below total
// pot Budget Limits (INCOME_BELOW_ALLOCATIONS).
async function deleteIncome(monthId, id) {
  const { data } = await api.delete(`/months/${monthId}/income/${id}`);
  return data.data;
}

const incomeService = { listIncome, createIncome, updateIncome, deleteIncome };
export default incomeService;
