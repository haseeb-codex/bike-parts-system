import { Navigate, Route, Routes } from 'react-router-dom';

import DashboardPage from '@/pages/DashboardPage';
import EmployeePage from '@/pages/EmployeePage';
import FinancialPage from '@/pages/FinancialPage';
import InventoryPage from '@/pages/InventoryPage';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import LoginPage from '@/pages/LoginPage';
import MaterialsPage from '@/pages/MaterialsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ProductionPage from '@/pages/ProductionPage';
import SalesPage from '@/pages/SalesPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import UtilityPage from '@/pages/UtilityPage';
import { Layout } from '@/components/Layout/Layout';
import { PrivateRoute } from '@/routes/PrivateRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicRoute } from '@/routes/PublicRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute restricted>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/account" element={<AccountSettingsPage />} />

          <Route element={<ProtectedRoute requiredRoles={['admin', 'manager']} />}>
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/financial" element={<FinancialPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredRoles={['admin']} />}>
            <Route path="/utilities" element={<UtilityPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}
