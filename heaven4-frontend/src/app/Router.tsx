import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from '@/workspaces/customer/context/CartContext';

// Synchronous imports ONLY for Login / Public Auth screens (for instant initial page render < 50ms)
import LoginScreen from '@/workspaces/auth/LoginScreen';
import StaffLoginScreen from '@/workspaces/auth/StaffLoginScreen';
import { ProtectedRoute } from '@/core/auth/ProtectedRoute';
import { DeveloperRoleSwitcher } from '@/core/auth/DeveloperRoleSwitcher';

// Dynamic lazy imports for heavy workspace components
const CustomerLayout = lazy(() => import('@/workspaces/customer/layouts/CustomerLayout'));
const EmployeeLayout = lazy(() => import('@/workspaces/employee/layouts/EmployeeLayout'));
const KitchenLayout = lazy(() => import('@/workspaces/kitchen/layouts/KitchenLayout'));
const ManagerLayout = lazy(() => import('@/workspaces/manager/layouts/ManagerLayout'));
const AdminLayout = lazy(() => import('@/workspaces/admin/layouts/AdminLayout'));
const OwnerLayout = lazy(() => import('@/workspaces/owner/layouts/OwnerLayout'));

const CustomerRouter = lazy(() => import('@/workspaces/customer/CustomerRouter'));
const EmployeeRouter = lazy(() => import('@/workspaces/employee/EmployeeRouter'));
const KitchenRouter = lazy(() => import('@/workspaces/kitchen/KitchenRouter'));
const ManagerRouter = lazy(() => import('@/workspaces/manager/ManagerRouter'));
const AdminRouter = lazy(() => import('@/workspaces/admin/AdminRouter'));
const OwnerRouter = lazy(() => import('@/workspaces/owner/OwnerRouter'));
const DeveloperPortal = lazy(() => import('@/workspaces/auth/DeveloperPortal'));

// Per-workspace preloader map
const workspacePreloaders: Record<string, () => Promise<any>> = {
  CUSTOMER: () => Promise.all([
    import('@/workspaces/customer/layouts/CustomerLayout'),
    import('@/workspaces/customer/CustomerRouter'),
  ]),
  EMPLOYEE: () => Promise.all([
    import('@/workspaces/employee/layouts/EmployeeLayout'),
    import('@/workspaces/employee/EmployeeRouter'),
  ]),
  KITCHEN: () => Promise.all([
    import('@/workspaces/kitchen/layouts/KitchenLayout'),
    import('@/workspaces/kitchen/KitchenRouter'),
  ]),
  MANAGER: () => Promise.all([
    import('@/workspaces/manager/layouts/ManagerLayout'),
    import('@/workspaces/manager/ManagerRouter'),
  ]),
  ADMIN: () => Promise.all([
    import('@/workspaces/admin/layouts/AdminLayout'),
    import('@/workspaces/admin/AdminRouter'),
  ]),
  OWNER: () => Promise.all([
    import('@/workspaces/owner/layouts/OwnerLayout'),
    import('@/workspaces/owner/OwnerRouter'),
  ]),
  DEVELOPER: () => import('@/workspaces/auth/DeveloperPortal'),
};

/** Preload a specific workspace JS bundle (e.g. on user input or login button hover) */
export function preloadWorkspace(workspace: string) {
  if (typeof window === 'undefined' || !workspace) return;
  const key = workspace.toUpperCase();
  if (workspacePreloaders[key]) {
    workspacePreloaders[key]().catch(() => {});
  }
}

/** Preload all workspace bundles lazily when idle */
export function preloadAllWorkspaces() {
  if (typeof window !== 'undefined') {
    const trigger = () => {
      Object.values(workspacePreloaders).forEach(fn => fn().catch(() => {}));
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(trigger, { timeout: 2000 });
    } else {
      setTimeout(trigger, 200);
    }
  }
}


// Lightweight fallback loader for Suspense
const WorkspaceLoader = () => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-400">Loading Workspace...</p>
    </div>
  </div>
);

// All workspaces that a developer can access (to allow role switching)
const DEV_AND = (...workspaces: string[]) => [...workspaces, 'DEVELOPER'];

export function AppRouter() {
  return (
    <Router>
      <DeveloperRoleSwitcher />
      <Suspense fallback={<WorkspaceLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          
          {/* Public Auth Routes (Synchronously loaded for immediate presentation) */}
          <Route path="/auth/login" element={<LoginScreen />} />
          <Route path="/staff-login" element={<StaffLoginScreen />} />

          {/* Protected Customer Routes (Lazy loaded + preloaded in background) */}
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

          {/* Developer Portal */}
          <Route element={<ProtectedRoute allowedWorkspaces={['DEVELOPER']} />}>
            <Route path="/developer/*" element={<DeveloperPortal />} />
          </Route>

          {/* Catch-all: redirect to login */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

