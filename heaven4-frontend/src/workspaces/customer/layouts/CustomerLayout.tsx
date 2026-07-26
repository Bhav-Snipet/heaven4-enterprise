import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { Home, Award, ShoppingBag, LogOut, User, MessageSquare, Crown, Bell } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '@/core/api/client';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [waiterModal, setWaiterModal] = useState(false);
  const [tableNo, setTableNo] = useState(localStorage.getItem('heaven4_table_number') || '');
  const [isCalling, setIsCalling] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const callWaiter = async (type: string) => {
    if (!tableNo.trim()) {
        toast.error("Please enter your table number first");
        return;
    }
    localStorage.setItem('heaven4_table_number', tableNo);
    setIsCalling(true);
    try {
        await apiClient.post(`/waiter/call/${tableNo}`, { type });
        toast.success(`Staff has been notified for ${type}`);
        setWaiterModal(false);
    } catch {
        toast.error("Failed to notify staff");
    } finally {
        setIsCalling(false);
    }
  };

  const navItems = [
    { to: '/customer/menu', icon: Home, label: 'Menu', end: true },
    { to: '/customer/membership', icon: Crown, label: 'VIP' },
    { to: '/customer/rewards', icon: Award, label: 'Rewards' },
    { to: '/customer/cart', icon: ShoppingBag, label: 'Cart', badge: items.length > 0 ? items.length : null },
    { to: '/customer/profile', icon: User, label: 'Profile' },
    { to: '/customer/complaint', icon: MessageSquare, label: 'Help' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col pb-20 md:pb-0 relative">
      {/* Premium Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link to="/customer/menu" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-heaven-400 to-indigo-600 flex items-center justify-center shadow-glow">
              <span className="font-bold text-white text-xl leading-none">H</span>
            </div>
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Heaven4
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/customer/membership" className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors cursor-pointer">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-slate-300">VIP</span>
            </Link>
            <Link to="/customer/profile" className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 hover:bg-white/10 transition-colors cursor-pointer">
              <User className="w-4 h-4 text-heaven-400" />
              <span className="text-sm font-medium text-slate-300">{user?.displayName || 'Guest'}</span>
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Desktop Sidebar + Main Content (future proofing) */}
      <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col md:flex-row relative">
        <main className="flex-1 w-full relative animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Floating Call Waiter Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setWaiterModal(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center z-40 border border-white/10"
      >
        <Bell className="w-6 h-6 text-white" />
      </motion.button>
      
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

      {/* Waiter Modal */}
      <AnimatePresence>
          {waiterModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                  onClick={() => setWaiterModal(false)}>
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                      className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl"
                      onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold flex items-center gap-2"><Bell className="text-indigo-400 w-5 h-5"/> Need Assistance?</h3>
                      </div>
                      
                      <div className="mb-6">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Table Number</label>
                          <input type="text" value={tableNo} onChange={(e) => setTableNo(e.target.value)}
                              placeholder="e.g. 12" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors text-center text-xl font-bold" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => callWaiter('Waiter')} disabled={isCalling} className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors">Call Waiter</button>
                          <button onClick={() => callWaiter('Water')} disabled={isCalling} className="py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl font-medium transition-colors">Water</button>
                          <button onClick={() => callWaiter('Bill')} disabled={isCalling} className="py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl font-medium transition-colors">Get Bill</button>
                          <button onClick={() => callWaiter('Cleaning')} disabled={isCalling} className="py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl font-medium transition-colors">Cleaning</button>
                      </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
