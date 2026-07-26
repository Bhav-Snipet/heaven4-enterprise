import { Routes, Route, Navigate } from 'react-router-dom';
import KitchenDashboard from './pages/KitchenDashboard';
import UserSettingsPage from '@/shared/components/UserSettingsPage';

export default function KitchenRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kitchen/dashboard" replace />} />
      <Route path="dashboard" element={<KitchenDashboard />} />
      <Route path="settings" element={<UserSettingsPage />} />
      <Route path="queue" element={<div>Station Queue</div>} />
    </Routes>
  );
}
