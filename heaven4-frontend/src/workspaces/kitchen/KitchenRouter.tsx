import { Routes, Route } from 'react-router-dom';
import KitchenDashboard from './pages/KitchenDashboard';

export default function KitchenRouter() {
  return (
    <Routes>
      <Route index element={<KitchenDashboard />} />
      <Route path="queue" element={<div>Station Queue</div>} />
    </Routes>
  );
}
