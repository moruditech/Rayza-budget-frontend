import api from './api';

// FR-04 — create a line item inside a pot.
// Accepts both INSTANT_SPEND and SINKING_FUND payloads; the service layer
// sends whatever the caller provides and lets the API validate type-specific
// fields (targetAmount, monthlyContribution).
async function createLineItem(monthId, potId, payload) {
  const { data } = await api.post(
    `/months/${monthId}/pots/${potId}/line-items`,
    payload
  );
  return data.data;
}

// FR-04 — update a line item (name, allocatedAmount, isRecurring, etc.).
async function updateLineItem(monthId, potId, id, payload) {
  const { data } = await api.patch(
    `/months/${monthId}/pots/${potId}/line-items/${id}`,
    payload
  );
  return data.data;
}

// FR-04 — delete a line item.
async function deleteLineItem(monthId, potId, id) {
  const { data } = await api.delete(
    `/months/${monthId}/pots/${potId}/line-items/${id}`
  );
  return data.data;
}

// FR-06 — trigger Mark as Used on a SINKING_FUND line item.
// Creates a SpendLog entry and resets the accumulatedBalance.
// Only valid when isReadyToUse is true.
async function markUsed(monthId, potId, id, payload) {
  const { data } = await api.post(
    `/months/${monthId}/pots/${potId}/line-items/${id}/mark-used`,
    payload
  );
  return data.data;
}

// Withdraw from a SINKING_FUND at any time (before or after its target).
// Reduces the accumulated balance and writes a spend log entry.
async function withdraw(monthId, potId, id, payload) {
  const { data } = await api.post(
    `/months/${monthId}/pots/${potId}/line-items/${id}/withdraw`,
    payload
  );
  return data.data;
}

// Mark a bill (an item with a due day) as paid, or undo it. payload: { paid }
async function markPaid(monthId, potId, id, paid) {
  const { data } = await api.post(
    `/months/${monthId}/pots/${potId}/line-items/${id}/paid`,
    { paid }
  );
  return data.data;
}

// Log interest the bank actually paid into an interest-bearing fund.
// payload: { amount, note?, date? }
async function recordInterest(monthId, potId, id, payload) {
  const { data } = await api.post(
    `/months/${monthId}/pots/${potId}/line-items/${id}/interest`,
    payload
  );
  return data.data;
}

// Invest part of the pot's remaining budget into a sinking fund (one-off,
// not repeated next month). payload: { amount, note? }
async function deposit(monthId, potId, id, payload) {
  const { data } = await api.post(
    `/months/${monthId}/pots/${potId}/line-items/${id}/deposit`,
    payload
  );
  return data.data;
}

// Move money from one sinking fund to another within the same month.
// payload: { fromLineItemId, toLineItemId, amount, note? }
async function transfer(monthId, payload) {
  const { data } = await api.post(`/months/${monthId}/transfers`, payload);
  return data.data;
}

const lineItemsService = {
  createLineItem,
  updateLineItem,
  deleteLineItem,
  markUsed,
  withdraw,
  deposit,
  recordInterest,
  markPaid,
  transfer,
};
export default lineItemsService;
