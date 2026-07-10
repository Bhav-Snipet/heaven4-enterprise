import { Routes, Route } from 'react-router-dom';

export default function OwnerRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Owner Financials Dashboard</div>} />
      <Route path="/branches" element={<div>Multi-branch View</div>} />
      <Route path="/health" element={<div>System Health Engine</div>} />
    </Routes>
  );
}
