import { format, parseISO } from 'date-fns';

// Formats an ISO string or Date for display.
// monthLabel(2025, 9)     → 'September 2025'   (header)
// shortDate('2025-09-10') → 'Sep 10'           (spend log rows)
// inputDate(new Date())   → '2025-09-10'       (date input value)

export function monthLabel(year, month) {
  const d = new Date(year, month - 1, 1);
  return format(d, 'MMMM yyyy');
}

export function shortDate(dateStr) {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(d, 'MMM d');
}

export function inputDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date ?? new Date();
  return format(d, 'yyyy-MM-dd');
}
