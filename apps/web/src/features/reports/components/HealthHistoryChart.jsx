import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Colour each bar by score band to give instant visual feedback.
function barColor(score) {
  if (score >= 80) return 'var(--primary)';
  if (score >= 60) return 'var(--gold)';
  return 'var(--warning)';
}

// FR-14 — Budget Health Score per locked month.
// data: [{ month: "Apr 2025", score: 82 }, ...]
export default function HealthHistoryChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', padding: '24px 0', textAlign: 'center' }}>
        No locked months yet — lock a month to see your health score history.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'var(--ink-muted)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.slice(0, 3)}
        />
        <YAxis domain={[0, 100]} hide />
        <Tooltip
          contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [`${v}`, 'Health score']}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
