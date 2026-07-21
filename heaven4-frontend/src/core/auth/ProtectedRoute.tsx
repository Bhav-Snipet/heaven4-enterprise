import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface ProtectedRouteProps {
    allowedRoles?: string[];
    allowedWorkspaces?: string[];
}

export function ProtectedRoute({ allowedRoles, allowedWorkspaces }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-heaven-500 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Role verification
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={`/${user.workspace.toLowerCase()}`} replace />;
    }

    // Workspace verification - DEVELOPER can access any route that includes 'DEVELOPER' in allowedWorkspaces
    if (allowedWorkspaces && !allowedWorkspaces.includes(user.workspace)) {
        return <Navigate to={`/${user.workspace.toLowerCase()}`} replace />;
    }

    return <Outlet />;
}
