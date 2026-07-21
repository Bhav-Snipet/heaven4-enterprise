import { Routes, Route, Navigate } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeComplaintsPage from './pages/EmployeeComplaintsPage';

export default function EmployeeRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
      <Route path="dashboard" element={<EmployeeDashboard />} />
      <Route path="complaints" element={<EmployeeComplaintsPage />} />
    </Routes>
  );
}
