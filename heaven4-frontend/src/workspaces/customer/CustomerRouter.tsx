import { Routes, Route, Navigate } from 'react-router-dom';
// Removed CartProvider import from here
import CustomerMenuPage from './pages/CustomerMenuPage';
import CustomerCartPage from './pages/CustomerCartPage';
import CustomerRewardsPage from './pages/CustomerRewardsPage';
import CustomerComplaintPage from './pages/CustomerComplaintPage';
import CustomerOrderStatusPage from './pages/CustomerOrderStatusPage';
import CustomerMembershipPage from './pages/CustomerMembershipPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

export default function CustomerRouter() {
  return (
    <Routes>
      <Route index element={<Navigate to="/customer/menu" replace />} />
      <Route path="menu" element={<CustomerMenuPage />} />
      <Route path="cart" element={<CustomerCartPage />} />
      <Route path="rewards" element={<CustomerRewardsPage />} />
      <Route path="complaint" element={<CustomerComplaintPage />} />
      <Route path="order-status" element={<CustomerOrderStatusPage />} />
      <Route path="membership" element={<CustomerMembershipPage />} />
      <Route path="profile" element={<CustomerProfilePage />} />
      <Route path="session" element={<div>Dining Session Page</div>} />
    </Routes>
  );
}
