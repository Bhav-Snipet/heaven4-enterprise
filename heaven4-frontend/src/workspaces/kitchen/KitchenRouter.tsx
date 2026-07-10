import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function KitchenRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Kitchen Dashboard</div>} />
      <Route path="/queue" element={<div>Station Queue</div>} />
    </Routes>
  );
}
