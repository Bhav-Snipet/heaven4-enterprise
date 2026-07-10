import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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

import LoginScreen from '@/workspaces/auth/LoginScreen';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/customer" replace />} />
        
        {/* Public Auth Route */}
        <Route path="/auth/login" element={<LoginScreen />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={['CUSTOMER']} />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route path="*" element={<CustomerRouter />} />
          </Route>
        </Route>

        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={['EMPLOYEE']} />}>
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route path="*" element={<EmployeeRouter />} />
          </Route>
        </Route>

        {/* Protected Kitchen Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={['KITCHEN']} />}>
          <Route path="/kitchen" element={<KitchenLayout />}>
            <Route path="*" element={<KitchenRouter />} />
          </Route>
        </Route>

        {/* Protected Manager Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={['MANAGER']} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route path="*" element={<ManagerRouter />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="*" element={<AdminRouter />} />
          </Route>
        </Route>

        {/* Protected Owner Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={['OWNER']} />}>
          <Route path="/owner" element={<OwnerLayout />}>
            <Route path="*" element={<OwnerRouter />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}
