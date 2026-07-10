import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function ManagerRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Manager Dashboard</div>} />
      <Route path="/floor" element={<div>Live Digital Twin</div>} />
      <Route path="/complaints" element={<div>Complaint Center</div>} />
      <Route path="/approvals" element={<div>Pending Approvals</div>} />
    </Routes>
  );
}
