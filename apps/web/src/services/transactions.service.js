import api from './api';

// FR-05 — log a spend transaction against an INSTANT_SPEND line item.
// Response includes updated pot spentAmount and surplus.
async function createTransaction(monthId, potId, lineItemId, payload, config) {
  const { data } = await api.post(
    `/months/${monthId}/pots/${potId}/line-items/${lineItemId}/transactions`,
    payload,
    config
  );
  return data.data;
}

// FR-05 — update amount, note, or paymentMethod on an existing transaction.
async function updateTransaction(monthId, potId, lineItemId, id, payload) {
  const { data } = await api.patch(
    `/months/${monthId}/pots/${potId}/line-items/${lineItemId}/transactions/${id}`,
    payload
  );
  return data.data;
}

// FR-05 — delete a transaction. Response includes updated pot spentAmount.
async function deleteTransaction(monthId, potId, lineItemId, id) {
  const { data } = await api.delete(
    `/months/${monthId}/pots/${potId}/line-items/${lineItemId}/transactions/${id}`
  );
  return data.data;
}

const transactionsService = {
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
export default transactionsService;
