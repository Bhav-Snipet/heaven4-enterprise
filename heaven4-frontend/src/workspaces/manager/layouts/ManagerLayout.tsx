import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';

export default function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/manager/complaints', icon: AlertCircle, label: 'Complaints' },
    { to: '/manager/approvals', icon: CheckCircle, label: 'Approvals' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-white">
      {/* Desktop Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-white/10 hidden md:flex flex-col z-10">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-glow">
              <span className="font-bold text-white text-lg leading-none">M</span>
            </div>
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Manager Ops</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                ${isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="mb-4 px-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Logged In</p>
            <p className="text-sm font-semibold text-slate-300">{user?.displayName}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light">
        <header className="md:hidden flex justify-between items-center mb-6 bg-slate-900 border border-white/10 text-white p-4 shadow-lg rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <span className="font-bold text-white text-xs">M</span>
            </div>
            <h1 className="text-lg font-bold">Manager Ops</h1>
          </div>
          <button onClick={handleLogout} className="text-slate-400"><LogOut className="w-5 h-5" /></button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
