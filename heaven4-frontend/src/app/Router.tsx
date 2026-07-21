import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from '@/workspaces/customer/context/CartContext';

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
import StaffLoginScreen from '@/workspaces/auth/StaffLoginScreen';
import DeveloperPortal from '@/workspaces/auth/DeveloperPortal';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';
import { DeveloperRoleSwitcher } from '@/core/auth/DeveloperRoleSwitcher';

// All workspaces that a developer can access (to allow role switching)
const DEV_AND = (...workspaces: string[]) => [...workspaces, 'DEVELOPER'];

export function AppRouter() {
  return (
    <Router>
      <DeveloperRoleSwitcher />
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* Public Auth Routes */}
        <Route path="/auth/login" element={<LoginScreen />} />
        <Route path="/staff-login" element={<StaffLoginScreen />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={DEV_AND('CUSTOMER', 'ADMIN', 'OWNER')} />}>
          <Route path="/customer/*" element={<CartProvider><CustomerLayout /></CartProvider>}>
            <Route path="*" element={<CustomerRouter />} />
          </Route>
        </Route>

        {/* Protected Employee Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={DEV_AND('EMPLOYEE', 'ADMIN', 'OWNER')} />}>
          <Route path="/employee/*" element={<EmployeeLayout />}>
            <Route path="*" element={<EmployeeRouter />} />
          </Route>
        </Route>

        {/* Protected Kitchen Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={DEV_AND('KITCHEN', 'ADMIN', 'OWNER')} />}>
          <Route path="/kitchen/*" element={<KitchenLayout />}>
            <Route path="*" element={<KitchenRouter />} />
          </Route>
        </Route>

        {/* Protected Manager Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={DEV_AND('MANAGER', 'ADMIN', 'OWNER')} />}>
          <Route path="/manager/*" element={<ManagerLayout />}>
            <Route path="*" element={<ManagerRouter />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={DEV_AND('ADMIN')} />}>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route path="*" element={<AdminRouter />} />
          </Route>
        </Route>

        {/* Protected Owner Routes */}
        <Route element={<ProtectedRoute allowedWorkspaces={DEV_AND('OWNER')} />}>
          <Route path="/owner/*" element={<OwnerLayout />}>
            <Route path="*" element={<OwnerRouter />} />
          </Route>
        </Route>

        {/* Developer Portal - where developer lands after login */}
        <Route element={<ProtectedRoute allowedWorkspaces={['DEVELOPER']} />}>
          <Route path="/developer/*" element={<DeveloperPortal />} />
        </Route>

        {/* Catch-all: redirect to login */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}
