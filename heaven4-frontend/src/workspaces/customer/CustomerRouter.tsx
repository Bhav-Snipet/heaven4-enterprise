import { Routes, Route, Navigate } from 'react-router-dom';
// Removed CartProvider import from here
import CustomerMenuPage from './pages/CustomerMenuPage';
import CustomerCartPage from './pages/CustomerCartPage';
import CustomerRewardsPage from './pages/CustomerRewardsPage';

export default function CustomerRouter() {
  return (
    <Routes>
      <Route index element={<Navigate to="/customer/menu" replace />} />
      <Route path="menu" element={<CustomerMenuPage />} />
      <Route path="cart" element={<CustomerCartPage />} />
      <Route path="rewards" element={<CustomerRewardsPage />} />
      <Route path="session" element={<div>Dining Session Page</div>} />
    </Routes>
  );
}
