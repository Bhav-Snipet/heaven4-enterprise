import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function EmployeeRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Employee Dashboard</div>} />
      <Route path="/tables" element={<div>Assigned Tables</div>} />
      <Route path="/tasks" element={<div>Tasks</div>} />
    </Routes>
  );
}
