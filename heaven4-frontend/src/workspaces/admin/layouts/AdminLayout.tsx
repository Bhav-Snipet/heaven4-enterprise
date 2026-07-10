import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Menu, Users, Settings } from 'lucide-react';

export default function AdminLayout() {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Menu & Catalog', path: '/admin/menu', icon: Menu },
    { name: 'Table Management', path: '/admin/tables', icon: Users },
    { name: 'System Settings', path: '/admin/features', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 dark:bg-slate-950 text-white hidden md:flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-heaven-400 to-indigo-400">
            Admin Workspace
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-heaven-600 text-white shadow-lg shadow-heaven-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 w-full max-h-screen overflow-y-auto">
        <header className="md:hidden flex justify-between items-center bg-slate-900 text-white p-4 shadow">
          <h1 className="text-lg font-bold">Admin Workspace</h1>
        </header>
        <div className="w-full">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
