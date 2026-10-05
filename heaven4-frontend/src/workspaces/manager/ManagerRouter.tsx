import { Routes, Route, Navigate } from 'react-router-dom';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerComplaintsPage from './pages/ManagerComplaintsPage';
import ManagerPointsOverridePage from './pages/ManagerPointsOverridePage';
import ManagerEventsPage from './pages/ManagerEventsPage';
import ManagerFinancePage from './pages/ManagerFinancePage';
import AdminTablesPage from '../admin/pages/AdminTablesPage';
import UserSettingsPage from '@/shared/components/UserSettingsPage';

export default function ManagerRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
      <Route path="dashboard" element={<ManagerDashboard />} />
      <Route path="events" element={<ManagerEventsPage />} />
      <Route path="tables" element={<AdminTablesPage />} />
      <Route path="complaints" element={<ManagerComplaintsPage />} />
      <Route path="approvals" element={
        <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">✅</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Pending Approvals</h2>
                <p className="text-slate-400 text-sm">No shift swaps or voids require your approval at this time. All operations are running smoothly.</p>
            </div>
        </div>
      } />
      <Route path="points-override" element={<ManagerPointsOverridePage />} />
      <Route path="finance" element={<ManagerFinancePage />} />
      <Route path="settings" element={<UserSettingsPage />} />
    </Routes>
  );
}
