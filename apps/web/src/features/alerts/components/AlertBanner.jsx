import Alert from '../../../components/ui/Alert/Alert';

// ── Icons ────────────────────────────────────────────────────────────────
// Inline SVG icons matching i-warn and i-spark from the HTML design.

function WarnIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v4M12 17v4M5 12H3M21 12h-2M7.5 7.5 6 6M18 18l-1.5-1.5M16.5 7.5 18 6M6 18l1.5-1.5" />
    </svg>
  );
}

// ── Alert type → variant + icon mapping ─────────────────────────────────
// FR-13 — all five alert conditions from the backend alerts module.
const CONFIG = {
  POT_APPROACHING_LIMIT: { variant: 'warn',  icon: <WarnIcon /> },
  POT_OVER_BUDGET:       { variant: 'warn',  icon: <WarnIcon /> },
  SINKING_FUND_READY:    { variant: 'ready', icon: <SparkIcon /> },
  UNALLOCATED_INCOME:    { variant: 'warn',  icon: <WarnIcon /> },
  STALE_BUDGET:          { variant: 'warn',  icon: <WarnIcon /> },
};

// Renders a single alert from the GET /alerts response.
// `alert` shape: { type, message, pot?, lineItem?, meta? }
export default function AlertBanner({ alert }) {
  const { variant = 'warn', icon = <WarnIcon /> } =
    CONFIG[alert.type] ?? {};

  return (
    <Alert variant={variant} icon={icon}>
      {alert.message}
    </Alert>
  );
}
