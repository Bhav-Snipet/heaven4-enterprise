import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

// Layouts
import CustomerLayout from '@/workspaces/customer/layouts/CustomerLayout';
import EmployeeLayout from '@/workspaces/employee/layouts/EmployeeLayout';
import KitchenLayout from '@/workspaces/kitchen/layouts/KitchenLayout';
import ManagerLayout from '@/workspaces/manager/layouts/ManagerLayout';
import AdminLayout from '@/workspaces/admin/layouts/AdminLayout';
import OwnerLayout from '@/workspaces/owner/layouts/OwnerLayout';

// Base Routers
import CustomerRouter from '@/workspaces/customer/CustomerRouter';
import EmployeeRouter from '@/workspaces/employee/EmployeeRouter';
import KitchenRouter from '@/workspaces/kitchen/KitchenRouter';
import ManagerRouter from '@/workspaces/manager/ManagerRouter';
import AdminRouter from '@/workspaces/admin/AdminRouter';
import OwnerRouter from '@/workspaces/owner/OwnerRouter';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/customer" replace />} />
        
        {/* Customer Workspace */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route path="*" element={<CustomerRouter />} />
        </Route>

        {/* Employee Workspace */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route path="*" element={<EmployeeRouter />} />
        </Route>

        {/* Kitchen Workspace */}
        <Route path="/kitchen" element={<KitchenLayout />}>
          <Route path="*" element={<KitchenRouter />} />
        </Route>

        {/* Manager Workspace */}
        <Route path="/manager" element={<ManagerLayout />}>
          <Route path="*" element={<ManagerRouter />} />
        </Route>

        {/* Admin Workspace */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="*" element={<AdminRouter />} />
        </Route>

        {/* Owner Workspace */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route path="*" element={<OwnerRouter />} />
        </Route>
      </Routes>
    </Router>
  );
}
