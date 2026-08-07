import { Routes, Route } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagementPage from './pages/AdminUserManagementPage';
import UserSettingsPage from '@/shared/components/UserSettingsPage';
import AdminTablesPage from './pages/AdminTablesPage';
import AdminEventsPage from './pages/AdminEventsPage';

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/menu" element={<CatalogPage />} />
      <Route path="/users" element={<AdminUserManagementPage />} />
      <Route path="/settings" element={<UserSettingsPage />} />
      <Route path="/tables" element={<AdminTablesPage />} />
      <Route path="/events" element={<AdminEventsPage />} />
      <Route path="/features" element={
        <div className="p-8 text-center text-slate-400 mt-20">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">System Settings</h2>
            <p>Configure API keys and global feature flags.</p>
        </div>
      } />
    </Routes>
  );
}
