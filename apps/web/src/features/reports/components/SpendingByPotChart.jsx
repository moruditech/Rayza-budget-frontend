import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency';

// FR-14 — Spending by pot: budget limit vs actual spent per pot.
// Horizontal layout so long pot names fit on the Y axis.
// data: [{ pot: "Lifestyle", budgetLimit: 3000, spentAmount: 2400 }, ...]
export default function SpendingByPotChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', padding: '24px 0', textAlign: 'center' }}>
        No pot data for this month.
      </p>
    );
  }

  const height = Math.max(data.length * 44, 120);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
      >
        <XAxis
          type="number"
          hide
          domain={[0, (dataMax) => Math.max(dataMax, 1)]}
        />
        <YAxis
          type="category"
          dataKey="pot"
          tick={{ fontSize: 10, fill: 'var(--ink-muted)' }}
          width={88}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [formatCurrency(v)]}
        />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="budgetLimit" name="Budget" fill="var(--border)"  radius={[0, 3, 3, 0]} maxBarSize={14} />
        <Bar dataKey="spentAmount" name="Spent"  fill="var(--primary)" radius={[0, 3, 3, 0]} maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
