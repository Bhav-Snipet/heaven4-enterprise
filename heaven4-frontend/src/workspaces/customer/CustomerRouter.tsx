import React from 'react';
import { Routes, Route } from 'react-router-dom';

export default function CustomerRouter() {
  return (
    <Routes>
      <Route path="/" element={<div>Customer Home Page</div>} />
      <Route path="/menu" element={<div>Menu Page</div>} />
      <Route path="/cart" element={<div>Cart Page</div>} />
      <Route path="/session" element={<div>Dining Session Page</div>} />
    </Routes>
  );
}
