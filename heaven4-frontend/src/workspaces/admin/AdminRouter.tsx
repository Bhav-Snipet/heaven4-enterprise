import { Routes, Route } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Admin Dashboard Overview</div>} />
      <Route path="/menu" element={<CatalogPage />} />
      <Route path="/tables" element={<div className="p-8">Table Management</div>} />
      <Route path="/features" element={<div className="p-8">Feature Registry</div>} />
      <Route path="/rules" element={<div className="p-8">Rule Simulator</div>} />
    </Routes>
  );
}
