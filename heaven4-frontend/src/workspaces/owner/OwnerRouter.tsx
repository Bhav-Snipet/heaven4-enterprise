import { Routes, Route } from 'react-router-dom';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerOrdersPage from './pages/OwnerOrdersPage';
import OwnerStaffPage from './pages/OwnerStaffPage';
import OwnerReportsPage from './pages/OwnerReportsPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';

export default function OwnerRouter() {
  return (
    <Routes>
      <Route path="/" element={<OwnerDashboard />} />
      <Route path="/orders" element={<OwnerOrdersPage />} />
      <Route path="/staff" element={<OwnerStaffPage />} />
      <Route path="/reports" element={<OwnerReportsPage />} />
      <Route path="/settings" element={<OwnerSettingsPage />} />
    </Routes>
  );
}
