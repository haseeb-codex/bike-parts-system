import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import MaterialsPage from './pages/MaterialsPage';
import ProductionPage from './pages/ProductionPage';
import UtilityPage from './pages/UtilityPage';
import EmployeePage from './pages/EmployeePage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import FinancialPage from './pages/FinancialPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/utilities" element={<UtilityPage />} />
        <Route path="/employees" element={<EmployeePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
