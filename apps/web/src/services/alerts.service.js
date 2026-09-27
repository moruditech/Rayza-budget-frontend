import api from './api';

// FR-13 — fetch all active alerts for the current calendar month.
// The endpoint resolves the month server-side; no monthId param needed.
async function getAlerts() {
  const { data } = await api.get('/alerts');
  return data.data;
}

const alertsService = { getAlerts };
export default alertsService;
