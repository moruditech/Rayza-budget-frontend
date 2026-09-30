import { useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useMonths } from '../../features/months/hooks/useMonths';
import { useMonthStore } from '../../store/monthStore';
import { monthLabel } from '../../utils/formatDate';
import UndoToast from '../../features/undo/UndoToast';
import OfflineBanner from '../../features/offline/OfflineBanner';
import styles from './AppLayout.module.css';

// ─── SVG icons ────────────────────────────────────────────────────────────

function IconOverview() {
  return (
    <svg viewBox="0 0 24 24" className={styles.tabIcon} aria-hidden="true">
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}
function IconPots() {
  return (
    <svg viewBox="0 0 24 24" className={styles.tabIcon} aria-hidden="true">
      <circle cx="9" cy="13" r="6" />
      <circle cx="15" cy="13" r="6" />
    </svg>
  );
}
function IconList() {
  return (
    <svg viewBox="0 0 24 24" className={styles.tabIcon} aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className={styles.tabIcon} aria-hidden="true">
      <path d="M4 20v-6M12 20V8M20 20v-11" />
    </svg>
  );
}
function BrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.brandIcon} aria-hidden="true">
      <circle cx="9" cy="13" r="6" />
      <circle cx="15" cy="13" r="6" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className={styles.settingsIcon} aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const TABS = [
  { to: '/',          label: 'Dashboard', icon: <IconOverview />, end: true },
  { to: '/pots',      label: 'Pots',      icon: <IconPots />              },
  { to: '/spend-log', label: 'Activity',  icon: <IconList />              },
  { to: '/reports',   label: 'Reports',   icon: <IconChart />             },
];

export default function AppLayout() {
  const { data: months } = useMonths();
  const { activeMonthId, setActiveMonth } = useMonthStore();

  // Resolve activeMonthId to the current calendar month on first load.
  useEffect(() => {
    if (!months?.length || activeMonthId) return;
    const now = new Date();
    const current = months.find(
      (m) => m.year === now.getFullYear() && m.month === now.getMonth() + 1
    );
    const target = current ?? months[0];
    if (target) setActiveMonth(target._id);
  }, [months, activeMonthId, setActiveMonth]);

  const activeSummary = months?.find((m) => m._id === activeMonthId);
  const label = activeSummary
    ? monthLabel(activeSummary.year, activeSummary.month)
    : null;
  const score = activeSummary?.healthScore;

  return (
    <div className={styles.app}>
      {/* ── Top header ── */}
      <header className={styles.top}>
        <div className={styles.brand}>
          <BrandIcon />
          <span className={styles.brandName}>Budget</span>
        </div>

        <div className={styles.topRight}>
          {/*
            Always render the months link so a new user with zero months
            can still reach the Months page to create their first month.
            Shows the active month label when one exists, otherwise a
            "Months" fallback so the link is always present.
          */}
          <Link to="/months" className={styles.monthLabel}>
            {label ?? 'Months'}
          </Link>

          {score != null && (
            <span className={styles.healthChip}>
              <strong>{score}</strong>{' '}
              <span className={styles.healthWord}>health</span>
            </span>
          )}

          <Link to="/settings" className={styles.settingsLink} aria-label="Settings">
            <IconSettings />
          </Link>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className={styles.main}>
        <OfflineBanner />
        <Outlet />
      </main>

      {/* ── Bottom tabbar ── */}
      <UndoToast />

      <nav className={styles.tabbar} aria-label="Main navigation">
        <div className={styles.tabbarInner}>
          {TABS.map(({ to, label: tabLabel, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [styles.tab, isActive ? styles.tabActive : '']
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {icon}
              <span>{tabLabel}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
