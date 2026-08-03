import { Routes, Route } from 'react-router-dom';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerOrdersPage from './pages/OwnerOrdersPage';
import OwnerStaffPage from './pages/OwnerStaffPage';
import OwnerTeamsPage from './pages/OwnerTeamsPage';
import OwnerAttendancePage from './pages/OwnerAttendancePage';
import OwnerReportsPage from './pages/OwnerReportsPage';
import OwnerSettingsPage from './pages/OwnerSettingsPage';
import OwnerPayrollPage from './pages/OwnerPayrollPage';
import OwnerCouponsPage from './pages/OwnerCouponsPage';
import OwnerEventsPage from './pages/OwnerEventsPage';
import UserSettingsPage from '@/shared/components/UserSettingsPage';

export default function OwnerRouter() {
  return (
    <Routes>
      <Route path="/" element={<OwnerDashboard />} />
      <Route path="events" element={<OwnerEventsPage />} />
      <Route path="orders" element={<OwnerOrdersPage />} />
      <Route path="staff" element={<OwnerStaffPage />} />
      <Route path="teams" element={<OwnerTeamsPage />} />
      <Route path="attendance" element={<OwnerAttendancePage />} />
      <Route path="payroll" element={<OwnerPayrollPage />} />
      <Route path="coupons" element={<OwnerCouponsPage />} />
      <Route path="reports" element={<OwnerReportsPage />} />
      <Route path="/settings" element={<OwnerSettingsPage />} />
      <Route path="/profile" element={<UserSettingsPage />} />
    </Routes>
  );
}
