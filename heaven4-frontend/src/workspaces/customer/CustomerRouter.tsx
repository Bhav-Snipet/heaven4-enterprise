import { Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CustomerMenuPage from './pages/CustomerMenuPage';
import CustomerCartPage from './pages/CustomerCartPage';

export default function CustomerRouter() {
  return (
    <CartProvider>
      <Routes>
      <Route index element={<Navigate to="/customer/menu" replace />} />
      <Route path="menu" element={<CustomerMenuPage />} />
      <Route path="cart" element={<CustomerCartPage />} />
      <Route path="session" element={<div>Dining Session Page</div>} />
    </Routes>
    </CartProvider>
  );
}
