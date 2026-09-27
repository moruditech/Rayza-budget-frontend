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

const lineItemsService = {
  createLineItem,
  updateLineItem,
  deleteLineItem,
  markUsed,
};
export default lineItemsService;
