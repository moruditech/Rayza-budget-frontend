// Month export — turns a month's detail + its full activity log into a CSV or
// PDF file for records. Everything here is plain functions (no React), so it
// can be tested on its own. The PDF library is loaded only when a PDF is
// actually requested, to keep the main bundle small.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const POT_TYPE_LABEL = { SPENDING: 'Spending', SAVING: 'Saving', INVESTMENT: 'Investment' };
const ITEM_TYPE_LABEL = { INSTANT_SPEND: 'Instant spend', SINKING_FUND: 'Sinking fund' };

const ENTRY_TYPE_LABEL = {
  INSTANT_SPEND: 'Spend',
  SINKING_FUND_USED: 'Withdrawal',
  SINKING_FUND_DEPOSIT: 'Added to fund',
  SINKING_FUND_INTEREST: 'Interest',
  TRANSFER_IN: 'Transfer in',
  TRANSFER_OUT: 'Transfer out',
};

// Money coming INTO a fund is positive, money leaving is negative.
const MONEY_IN = new Set(['TRANSFER_IN', 'SINKING_FUND_DEPOSIT', 'SINKING_FUND_INTEREST']);

const PAYMENT_LABEL = { CARD: 'Card', CASH: 'Cash', EFT: 'EFT', OTHER: 'Other' };

const num = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

/** Plain-ASCII rand for the PDF: "R 12 250.00" (regular spaces, always 2 decimals). */
export function pdfMoney(value) {
  const n = num(value);
  const [whole, dec] = Math.abs(n).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${n < 0 ? '-' : ''}R ${grouped}.${dec}`;
}

const dateOnly = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export function monthTitle(month) {
  return `${MONTH_NAMES[month.month - 1]} ${month.year}`;
}

export function exportFileName(month, ext) {
  return `budget-${month.year}-${String(month.month).padStart(2, '0')}.${ext}`;
}

// Where an activity entry's money came from / went to, in plain text.
function where(counterparty) {
  if (!counterparty?.lineItemName) return 'another fund';
  return counterparty.potName
    ? `${counterparty.lineItemName} (${counterparty.potName})`
    : counterparty.lineItemName;
}

function entryNote(entry) {
  const note = entry.note || '';
  switch (entry.type) {
    case 'TRANSFER_IN':
      return `Received from ${where(entry.counterparty)}${note ? ` - ${note}` : ''}`;
    case 'TRANSFER_OUT':
      return `Moved to ${where(entry.counterparty)}${note ? ` - ${note}` : ''}`;
    case 'SINKING_FUND_INTEREST':
      return `${entry.expectedAmount != null ? `Rate predicted ${pdfMoney(entry.expectedAmount)}` : ''}${note ? `${entry.expectedAmount != null ? ' - ' : ''}${note}` : ''}`;
    case 'SINKING_FUND_DEPOSIT':
      return `From the pot budget${note ? ` - ${note}` : ''}`;
    default:
      return note;
  }
}

/**
 * Builds the export model.
 * @param month   month detail from GET /months/:id
 * @param entries every activity entry of that month (GET /spend-log?monthId=)
 */
export function buildExportModel(month, entries = []) {
  const pots = month.pots ?? [];
  const items = pots.flatMap((p) => (p.lineItems ?? []).map((li) => ({ pot: p, li })));

  const totalBudget = pots.reduce((s, p) => s + num(p.budgetLimit), 0);
  const totalSpent = pots.reduce((s, p) => s + num(p.spentAmount), 0);
  const totalInFunds = pots.reduce((s, p) => s + num(p.committedAmount), 0);
  const totalLeft = pots.reduce((s, p) => s + num(p.remaining), 0);

  const summary = [
    ['Status', month.isLocked ? 'Locked' : 'Open'],
    ['Health score', month.healthScore != null ? String(month.healthScore) : ''],
    ['Income', num(month.totalIncome)],
    ['Budgeted across pots', totalBudget],
    ['Not yet allocated', num(month.unallocatedIncome)],
    ['Spent', totalSpent],
    ['Put into sinking funds', totalInFunds],
    ['Left in pots', totalLeft],
  ];

  const income = (month.income ?? []).map((i) => [i.label, num(i.amount)]);

  const potRows = pots.map((p) => [
    p.name,
    POT_TYPE_LABEL[p.type] ?? p.type,
    num(p.budgetLimit),
    num(p.rolloverBalance),
    num(p.spentAmount),
    num(p.committedAmount),
    num(p.remaining),
    num(p.transferredIn),
    num(p.transferredOut),
  ]);

  const itemRows = items.map(({ pot, li }) => [
    pot.name,
    li.name,
    ITEM_TYPE_LABEL[li.type] ?? li.type,
    num(li.allocatedAmount),
    li.type === 'INSTANT_SPEND' ? num(li.spentAmount) : '',
    li.type === 'SINKING_FUND' ? num(li.accumulatedBalance) : '',
    li.dueDay != null ? li.dueDay : '',
    li.dueDay != null ? (li.isPaid ? 'Paid' : 'Not paid') : '',
  ]);

  const fundRows = items
    .filter(({ li }) => li.type === 'SINKING_FUND')
    .map(({ pot, li }) => {
      const pc = li.progressCheck;
      const status = !pc
        ? ''
        : pc.status === 'REACHED'
          ? 'Target reached'
          : pc.status === 'ON_TRACK'
            ? 'On track'
            : `Behind by ${pdfMoney(pc.shortfall)}/month`;
      return [
        li.name,
        pot.name,
        num(li.accumulatedBalance),
        num(li.targetAmount),
        num(li.targetAmount) > 0
          ? Math.min(100, Math.round((num(li.accumulatedBalance) / num(li.targetAmount)) * 100))
          : 0,
        dateOnly(li.targetDate),
        li.annualInterestRate != null ? num(li.annualInterestRate) : '',
        li.annualInterestRate != null ? num(li.interestEarned) : '',
        li.projection ? num(li.projection.projectedFutureValue) : '',
        pc ? num(pc.requiredMonthly) : '',
        status,
      ];
    });

  // Oldest first reads like a statement.
  const ordered = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const transactions = ordered.map((e) => {
    const signed = MONEY_IN.has(e.type) ? num(e.amount) : -num(e.amount);
    const isSpend = !e.type || e.type === 'INSTANT_SPEND';
    return [
      dateOnly(e.date),
      ENTRY_TYPE_LABEL[e.type] ?? 'Spend',
      e.lineItem?.name ?? '',
      e.pot?.name ?? '',
      signed,
      isSpend ? (PAYMENT_LABEL[e.paymentMethod] ?? e.paymentMethod ?? '') : '',
      isSpend ? (e.note ?? '') : entryNote(e),
    ];
  });

  return {
    title: monthTitle(month),
    summary,
    income,
    pots: potRows,
    items: itemRows,
    funds: fundRows,
    transactions,
    headers: {
      income: ['Source', 'Amount (R)'],
      pots: ['Pot', 'Type', 'Budget (R)', 'Rollover (R)', 'Spent (R)', 'In funds (R)', 'Left (R)', 'Received (R)', 'Moved out (R)'],
      items: ['Pot', 'Line item', 'Type', 'Allocated (R)', 'Spent (R)', 'Fund balance (R)', 'Due day', 'Bill status'],
      funds: ['Fund', 'Pot', 'Balance (R)', 'Target (R)', 'Progress (%)', 'Goal date', 'Interest rate (% p.a.)', 'Interest earned (R)', 'Projected value (R)', 'Needed per month (R)', 'Status'],
      transactions: ['Date', 'Type', 'Item', 'Pot', 'Amount (R)', 'Method', 'Note'],
    },
  };
}

// ── CSV ──────────────────────────────────────────────────────────────────

function csvCell(value) {
  if (value == null) return '';
  const text = typeof value === 'number' ? (Number.isInteger(value) ? String(value) : value.toFixed(2)) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const csvRow = (cells) => cells.map(csvCell).join(',');

/**
 * One file, several sections separated by a blank line and a heading row.
 * Amounts are plain numbers (no currency symbol) so a spreadsheet can add
 * them up; a UTF-8 BOM makes Excel read the file correctly.
 */
export function buildCsv(model) {
  const lines = [];
  const section = (title, headers, rows) => {
    if (lines.length) lines.push('');
    lines.push(csvRow([title]));
    if (headers) lines.push(csvRow(headers));
    if (rows.length === 0) lines.push(csvRow(['(none)']));
    rows.forEach((r) => lines.push(csvRow(r)));
  };

  section(`Budget - ${model.title}`, ['Summary', 'Value (R)'], model.summary);
  section('Income', model.headers.income, model.income);
  section('Pots', model.headers.pots, model.pots);
  section('Line items', model.headers.items, model.items);
  section('Sinking funds', model.headers.funds, model.funds);
  section('Activity', model.headers.transactions, model.transactions);

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

// ── PDF ──────────────────────────────────────────────────────────────────

const GREEN = [46, 125, 98];
const INK = [30, 36, 33];
const MUTED = [110, 118, 114];

/** Returns a jsPDF document (not yet saved). */
export async function buildPdf(model) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  // Depending on the bundler the function is the default export, a named
  // export, or nested one level deeper (CommonJS interop) — accept all three.
  const autoTable =
    typeof autoTableModule.default === 'function'
      ? autoTableModule.default
      : (autoTableModule.default?.default ?? autoTableModule.autoTable);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text(`Budget - ${model.title}`, marginX, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`, marginX, 24);

  let y = 30;

  const heading = (text) => {
    // Keep a heading together with the start of its table.
    if (y > 235) {
      doc.addPage();
      y = 18;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...INK);
    doc.text(text, marginX, y);
    y += 3;
  };

  const table = (head, body, columnStyles = {}, fontSize = 8.5) => {
    autoTable(doc, {
      startY: y,
      head: [head],
      body: body.length ? body : [['(none)']],
      theme: 'striped',
      margin: { left: marginX, right: marginX, bottom: 16 },
      rowPageBreak: 'avoid',
      styles: { font: 'helvetica', fontSize, cellPadding: 1.8, textColor: INK, overflow: 'linebreak' },
      headStyles: { fillColor: GREEN, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [244, 247, 245] },
      columnStyles,
      // Numbers are right-aligned; make their column headers follow.
      didParseCell: (data) => {
        if (data.section === 'head' && columnStyles[data.column.index]?.halign) {
          data.cell.styles.halign = columnStyles[data.column.index].halign;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 9;
  };

  const money = (v) => (v === '' || v == null ? '' : pdfMoney(v));
  const right = { halign: 'right' };

  // Summary
  heading('Summary');
  table(
    ['Item', 'Value'],
    model.summary.map(([label, value]) => [label, typeof value === 'number' ? pdfMoney(value) : value]),
    { 1: right },
    9.5
  );

  heading('Income');
  table(['Source', 'Amount'], model.income.map(([l, a]) => [l, money(a)]), { 1: right });

  heading('Pots');
  table(
    ['Pot', 'Type', 'Budget', 'Spent', 'In funds', 'Left'],
    model.pots.map((r) => [r[0], r[1], money(r[2]), money(r[4]), money(r[5]), money(r[6])]),
    { 2: right, 3: right, 4: right, 5: right }
  );

  heading('Line items');
  table(
    ['Pot', 'Line item', 'Type', 'Allocated', 'Spent', 'Fund balance', 'Bill'],
    model.items.map((r) => [
      r[0], r[1], r[2], money(r[3]), money(r[4]), money(r[5]),
      r[6] === '' ? '' : `Due ${r[6]}th - ${r[7]}`,
    ]),
    { 3: right, 4: right, 5: right }
  );

  heading('Sinking funds');
  table(
    ['Fund', 'Balance', 'Target', '%', 'Goal date', 'Interest', 'Projected', 'Status'],
    model.funds.map((r) => [
      `${r[0]}\n${r[1]}`,
      money(r[2]),
      money(r[3]),
      `${r[4]}%`,
      r[5],
      r[6] === '' ? '-' : `${r[6]}% p.a.\nearned ${money(r[7])}`,
      money(r[8]) || '-',
      r[10] || '-',
    ]),
    { 1: right, 2: right, 3: right, 6: right },
    8
  );

  heading('Activity');
  table(
    ['Date', 'Type', 'Item / pot', 'Amount', 'Note'],
    model.transactions.map((r) => [
      r[0],
      r[1],
      r[3] ? `${r[2]}\n${r[3]}` : r[2],
      pdfMoney(r[4]),
      [r[5], r[6]].filter(Boolean).join(' - '),
    ]),
    { 3: right },
    8
  );

  // Footer: page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${i} of ${pages}`, pageWidth - marginX, 290, { align: 'right' });
    doc.text(`Budget - ${model.title}`, marginX, 290);
  }

  return doc;
}

// ── Download ─────────────────────────────────────────────────────────────

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give the browser a moment to start the download before freeing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadMonthExport(month, entries, format) {
  const model = buildExportModel(month, entries);
  if (format === 'csv') {
    downloadBlob(
      new Blob([buildCsv(model)], { type: 'text/csv;charset=utf-8' }),
      exportFileName(month, 'csv')
    );
    return;
  }
  const doc = await buildPdf(model);
  downloadBlob(doc.output('blob'), exportFileName(month, 'pdf'));
}
