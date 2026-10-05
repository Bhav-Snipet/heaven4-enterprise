import { Routes, Route } from 'react-router-dom';
import { Server } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Server className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">System Feature Flags</h2>
                <p className="text-slate-400 text-sm">Configure API keys, third-party integrations, and global feature toggles. Coming in the next release.</p>
            </div>
        </div>
      } />
    </Routes>
  );
}
