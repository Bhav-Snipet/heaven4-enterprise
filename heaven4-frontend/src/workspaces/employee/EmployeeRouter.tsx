import { Routes, Route } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';

export default function EmployeeRouter() {
  return (
    <Routes>
      <Route path="/" element={<EmployeeDashboard />} />
    </Routes>
  );
}
