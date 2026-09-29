import monthsService from '../../services/months.service';
import spendLogService from '../../services/spendLog.service';
import { downloadMonthExport } from '../../utils/monthExport';

// The API returns at most 100 entries per page, so keep asking until we have
// every activity entry of the month.
async function fetchAllEntries(monthId) {
  const limit = 100;
  const all = [];
  let page = 1;
  // Hard stop at 100 pages (10 000 entries) so a bad response can never loop forever.
  while (page <= 100) {
    // eslint-disable-next-line no-await-in-loop
    const { entries, meta } = await spendLogService.getSpendLog({ monthId, page, limit });
    all.push(...entries);
    if (all.length >= (meta?.total ?? 0) || entries.length === 0) break;
    page += 1;
  }
  return all;
}

// Downloads a month as 'csv' or 'pdf'. Always fetches fresh data so the file
// matches what is in the database, not a cached screen.
export async function exportMonth(monthId, format) {
  const [month, entries] = await Promise.all([
    monthsService.getMonth(monthId),
    fetchAllEntries(monthId),
  ]);
  await downloadMonthExport(month, entries, format);
}
