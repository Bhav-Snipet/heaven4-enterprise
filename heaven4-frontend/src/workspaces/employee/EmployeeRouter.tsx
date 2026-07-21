import { Routes, Route } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeComplaintsPage from './pages/EmployeeComplaintsPage';
import EmployeePointsOverridePage from './pages/EmployeePointsOverridePage';

export default function EmployeeRouter() {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboard />} />
      <Route path="/complaints" element={<EmployeeComplaintsPage />} />
      <Route path="/rewards-override" element={<EmployeePointsOverridePage />} />
    </Routes>
  );
}
