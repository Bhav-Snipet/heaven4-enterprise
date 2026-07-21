import { Routes, Route, Navigate } from 'react-router-dom';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerComplaintsPage from './pages/ManagerComplaintsPage';
import ManagerPointsOverridePage from './pages/ManagerPointsOverridePage';

export default function ManagerRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/manager/dashboard" replace />} />
      <Route path="dashboard" element={<ManagerDashboard />} />
      <Route path="complaints" element={<ManagerComplaintsPage />} />
      <Route path="approvals" element={
        <div className="p-8 text-center text-slate-400 mt-20">
            <h2 className="text-2xl font-bold text-white mb-2">Pending Approvals</h2>
            <p>No shift swaps or voids require approval at this time.</p>
        </div>
      } />
      <Route path="points-override" element={<ManagerPointsOverridePage />} />
    </Routes>
  );
}
