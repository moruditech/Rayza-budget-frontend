// FR-06 — Circular progress ring for sinking fund line items.
// Matches the ring() helper from the HTML design exactly:
//   r=18, viewBox="0 0 44 44", stroke-width=4
//
// Props:
//   value — accumulated balance
//   max   — target amount
//   size  — rendered width/height in px (default 44)
export default function ProgressRing({ value = 0, max = 0, size = 44 }) {
  const r = 18;
  const circumference = 2 * Math.PI * r; // ≈ 113.1
  const pct = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <svg
      viewBox="0 0 44 44"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Track */}
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="var(--ring-track)"
        strokeWidth="4"
      />
      {/* Progress */}
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}
