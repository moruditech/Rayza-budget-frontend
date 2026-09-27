import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthLayout   from '../layouts/AuthLayout/AuthLayout';
import AppLayout    from '../layouts/AppLayout/AppLayout';
import LoginPage    from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PotsPage     from '../pages/pots/PotsPage';
import SpendLogPage from '../pages/spendLog/SpendLogPage';
import ReportsPage  from '../pages/reports/ReportsPage';
import MonthsPage   from '../pages/months/MonthsPage';
import SettingsPage from '../pages/settings/SettingsPage';

// ─── Guards ────────────────────────────────────────────────────────────────

function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function GuestGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

// ─── Router ────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login',    element: <LoginPage />    },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true,        element: <DashboardPage /> },
          { path: '/pots',      element: <PotsPage />      },
          { path: '/spend-log', element: <SpendLogPage />  },
          { path: '/reports',   element: <ReportsPage />   },
          { path: '/months',    element: <MonthsPage />    },
          { path: '/settings',  element: <SettingsPage />  },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
