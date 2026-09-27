import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency';

// Cycle through design tokens for multi-fund lines.
const LINE_COLORS = [
  'var(--primary)',
  'var(--gold)',
  'var(--warning)',
];

// FR-14 — Sinking Fund Progress: accumulated balance over time per fund.
// data: [{ lineItem: "Driver's Licence", target: 4500, history: [{ month, balance }] }]
export default function SinkingFundProgressChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', padding: '24px 0', textAlign: 'center' }}>
        No sinking funds found.
      </p>
    );
  }

  // Flatten into [{ month, [fundName]: balance, ... }] for Recharts.
  const months = data[0]?.history?.map((h) => h.month) ?? [];
  const chartData = months.map((month, i) => {
    const point = { month };
    data.forEach((fund) => {
      point[fund.lineItem] = fund.history[i]?.balance ?? 0;
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'var(--ink-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.slice(0, 3)}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [formatCurrency(v)]}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        {data.map((fund, i) => (
          <Line
            key={fund.lineItem}
            type="monotone"
            dataKey={fund.lineItem}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
        {/* Target reference lines — one per fund */}
        {data.map((fund, i) => (
          <ReferenceLine
            key={`ref-${fund.lineItem}`}
            y={fund.target}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeDasharray="4 2"
            strokeOpacity={0.4}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
