import { useMonthStore } from '../../store/monthStore';
import {
  useIncomeVsSpend,
  useSpendingByPot,
  useSinkingFundProgress,
  useHealthHistory,
  useCategoryBreakdown,
  usePotComparison,
} from '../../features/reports/hooks/useReports';
import IncomeVsSpendChart      from '../../features/reports/components/IncomeVsSpendChart';
import CategoryBreakdownChart  from '../../features/reports/components/CategoryBreakdownChart';
import HealthHistoryChart      from '../../features/reports/components/HealthHistoryChart';
import PotComparison         from '../../features/reports/components/PotComparison';
import SpendingByPotChart      from '../../features/reports/components/SpendingByPotChart';
import SinkingFundProgressChart from '../../features/reports/components/SinkingFundProgressChart';
import styles from './ReportsPage.module.css';

// Thin section wrapper — section title + content slot.
function Section({ title, children, style }) {
  return (
    <section className={styles.section} style={style}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

// FR-14 — Reports page: five chart sections.
// The first two (Income vs Spend, Category Breakdown) match the HTML design
// exactly using custom SVG/CSS. The remaining three use Recharts with the
// same design tokens.
export default function ReportsPage() {
  const { activeMonthId } = useMonthStore();

  const { data: incomeVsSpend       } = useIncomeVsSpend(6);
  const { data: spendingByPot       } = useSpendingByPot(activeMonthId);
  const { data: sinkingFundProgress } = useSinkingFundProgress(6);
  const { data: healthHistory       } = useHealthHistory(6);
  const { data: categoryBreakdown   } = useCategoryBreakdown(activeMonthId);
  const { data: potComparison       } = usePotComparison(activeMonthId);

  return (
    <>
      {/* FR-14 — Income vs Total Spend (matches HTML design exactly) */}
      <Section title="Income vs Spend">
        <IncomeVsSpendChart data={incomeVsSpend ?? []} />
      </Section>

      {/* FR-14 — Category Breakdown donut (matches HTML design exactly) */}
      <Section title="Category Breakdown">
        <CategoryBreakdownChart data={categoryBreakdown ?? []} />
      </Section>

      {/* FR-14 — Spending by Pot — Recharts horizontal bars */}
      <Section title="Spending by Pot">
        <SpendingByPotChart data={spendingByPot ?? []} />
      </Section>

      <Section title="Vs Last Month">
        <PotComparison data={potComparison} />
      </Section>

      {/* FR-14 — Budget Health History — Recharts coloured bars */}
      <Section title="Health History">
        <HealthHistoryChart data={healthHistory ?? []} />
      </Section>

      {/* FR-14 — Sinking Fund Progress — Recharts multi-line */}
      <Section title="Sinking Fund Progress">
        <SinkingFundProgressChart data={sinkingFundProgress ?? []} />
      </Section>
    </>
  );
}
