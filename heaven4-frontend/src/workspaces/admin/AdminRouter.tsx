import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Admin Dashboard</div>} />
      <Route path="/menu" element={<div>Menu Management</div>} />
      <Route path="/tables" element={<div>Table Management</div>} />
      <Route path="/features" element={<div>Feature Registry</div>} />
      <Route path="/rules" element={<div>Rule Simulator</div>} />
    </Routes>
  );
}
