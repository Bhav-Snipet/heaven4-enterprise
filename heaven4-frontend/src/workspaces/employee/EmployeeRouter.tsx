import { Routes, Route } from 'react-router-dom';
import EmployeePosPage from './pages/EmployeePosPage';

export default function EmployeeRouter() {
  return (
    <Routes>
      <Route path="/" element={<EmployeePosPage />} />
      <Route path="/tables" element={<div>Assigned Tables</div>} />
      <Route path="/tasks" element={<div>Tasks</div>} />
    </Routes>
  );
}
