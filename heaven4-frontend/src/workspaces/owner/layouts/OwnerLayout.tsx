import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, BarChart3, Settings, LogOut, Hexagon, DollarSign } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';

export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/owner', icon: LayoutDashboard, label: 'Executive Dashboard', end: true },
    { to: '/owner/orders', icon: ShoppingBag, label: 'Order History' },
    { to: '/owner/staff', icon: Users, label: 'Staff & Team' },
    { to: '/owner/payroll', icon: DollarSign, label: 'Payroll & HR' },
    { to: '/owner/reports', icon: BarChart3, label: 'Financial Reports' },
    { to: '/owner/settings', icon: Settings, label: 'Global Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light">
      <aside className="w-full md:w-72 bg-black/80 backdrop-blur-xl shadow-2xl hidden md:flex flex-col border-r border-slate-800 z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Hexagon className="w-6 h-6 text-black fill-gold-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gold-400 leading-tight">Heaven4</h1>
              <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">HQ Portal</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold
                ${isActive 
                  ? 'bg-gold-500/10 text-gold-400 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.2)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-4">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Owner Logged In</p>
            <p className="text-sm font-semibold text-slate-300">{user?.displayName}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
      
      <main className="flex-1 w-full mx-auto overflow-y-auto">
        <header className="md:hidden flex justify-between items-center mb-4 bg-black/90 backdrop-blur-md text-white p-4 shadow border-b border-slate-800 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-gold-400" />
            <h1 className="text-lg font-bold text-gold-400">Heaven4 HQ</h1>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400"><LogOut className="w-5 h-5" /></button>
        </header>
        <div className="w-full h-full max-w-7xl mx-auto p-4 md:p-8">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
