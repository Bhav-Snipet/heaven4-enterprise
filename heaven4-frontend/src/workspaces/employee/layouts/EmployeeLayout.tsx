import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Coffee } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 shadow-soft hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Staff POS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/employee')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold"
          >
            <Coffee className="w-5 h-5" />
            Live Orders
          </button>
          
          <button 
            onClick={() => navigate('/employee/complaints')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Complaints Overview
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Logged In</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.displayName || 'Employee'}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 w-full mx-auto overflow-y-auto">
        <header className="md:hidden flex justify-between items-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 shadow-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold">Staff POS</h1>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
        </header>
        <div className="w-full h-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
