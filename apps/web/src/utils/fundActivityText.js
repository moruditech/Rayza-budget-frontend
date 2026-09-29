import { formatCurrency } from './formatCurrency';

// "Emergency (Savings)" / "Emergency" / "another fund"
function whereText(counterparty) {
  if (!counterparty?.lineItemName) return 'another fund';
  return counterparty.potName
    ? `${counterparty.lineItemName} (${counterparty.potName})`
    : counterparty.lineItemName;
}

// One-line, human-readable description of a fund history / activity entry.
//   TRANSFER_IN       → "Received R 250 from Emergency (Savings)"
//   TRANSFER_OUT      → "Moved R 250 to Cash Built (Build Home)"
//   SINKING_FUND_DEPOSIT → "Added R 1 050 from the pot budget"
//   SINKING_FUND_USED → "Withdrew R 1 000 — House plan"
export function describeFundEntry(entry) {
  const amount = formatCurrency(entry.amount);
  switch (entry.type) {
    case 'TRANSFER_IN':
      return `Received ${amount} from ${whereText(entry.counterparty)}`;
    case 'TRANSFER_OUT':
      return `Moved ${amount} to ${whereText(entry.counterparty)}`;
    case 'SINKING_FUND_DEPOSIT':
      return entry.note
        ? `Added ${amount} from the pot budget — ${entry.note}`
        : `Added ${amount} from the pot budget`;
    case 'SINKING_FUND_USED':
      return entry.note ? `Withdrew ${amount} — ${entry.note}` : `Withdrew ${amount}`;
    default:
      return entry.note || amount;
  }
}
