import api from './api';

// FR-14 — income vs total spend, month-over-month.
async function getIncomeVsSpend(months = 6) {
  const { data } = await api.get('/reports/income-vs-spend', { params: { months } });
  return data.data;
}

// FR-14 — spending per pot for a given month.
async function getSpendingByPot(monthId) {
  const { data } = await api.get('/reports/spending-by-pot', { params: { monthId } });
  return data.data;
}

// FR-14 — sinking fund accumulated balance over time.
async function getSinkingFundProgress(months = 6) {
  const { data } = await api.get('/reports/sinking-fund-progress', { params: { months } });
  return data.data;
}

// FR-14 — budget health score per locked month.
async function getHealthHistory(months = 6) {
  const { data } = await api.get('/reports/health-history', { params: { months } });
  return data.data;
}

// FR-14 — percentage of income per pot type for a given month.
async function getCategoryBreakdown(monthId) {
  const { data } = await api.get('/reports/category-breakdown', { params: { monthId } });
  return data.data;
}

const reportsService = {
  getIncomeVsSpend,
  getSpendingByPot,
  getSinkingFundProgress,
  getHealthHistory,
  getCategoryBreakdown,
};
export default reportsService;
