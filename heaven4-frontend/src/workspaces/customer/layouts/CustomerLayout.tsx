import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Award, ShoppingBag, LogOut, User } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navItems = [
    { to: '/customer', icon: Home, label: 'Menu', end: true },
    { to: '/customer/rewards', icon: Award, label: 'Rewards' },
    { to: '/customer/cart', icon: ShoppingBag, label: 'Cart', badge: items.length > 0 ? items.length : null },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col pb-20 md:pb-0">
      {/* Premium Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-heaven-400 to-indigo-600 flex items-center justify-center shadow-glow">
              <span className="font-bold text-white text-xl leading-none">H</span>
            </div>
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Heaven4
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
              <User className="w-4 h-4 text-heaven-400" />
              <span className="text-sm font-medium text-slate-300">{user?.displayName || 'Guest'}</span>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Desktop Sidebar + Main Content (future proofing) */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row">
        {/* Mobile Main */}
        <main className="flex-1 w-full relative animate-fade-in">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-white/10 pb-safe z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                relative flex flex-col items-center justify-center w-16 h-full gap-1 transition-all
                ${isActive ? 'text-heaven-400' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg border border-slate-900">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottomNavIndicator"
                      className="absolute -top-[1px] w-8 h-[3px] bg-heaven-400 rounded-b-full shadow-glow" 
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
