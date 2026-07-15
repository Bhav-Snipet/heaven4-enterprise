import { Routes, Route } from 'react-router-dom';
import OwnerDashboard from './pages/OwnerDashboard';

export default function OwnerRouter() {
  return (
    <Routes>
      <Route path="/" element={<OwnerDashboard />} />
      <Route path="/branches" element={<div>Multi-branch View</div>} />
      <Route path="/health" element={<div>System Health Engine</div>} />
    </Routes>
  );
}
