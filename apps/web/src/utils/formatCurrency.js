// Formats a number as South African Rand with space-separated thousands.
// Matches the HTML demo's fmt() function: fmt(1500) → 'R 1 500'
// Negative values are prefixed with a minus: -R 150
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return 'R 0';

  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-ZA').replace(/,/g, '\u202F'); // narrow no-break space
  return `${amount < 0 ? '-' : ''}R\u00A0${formatted}`;
}
