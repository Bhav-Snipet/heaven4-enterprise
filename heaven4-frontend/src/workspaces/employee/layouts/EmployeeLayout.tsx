import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Coffee, Volume2, VolumeX, User } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';
import { useAudioAlerts } from '@/core/contexts/AudioProvider';

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMuted, toggleMute, playSound } = useAudioAlerts();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-950 text-white shadow-2xl hidden md:flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Staff POS</h1>
              <p className="text-[10px] text-blue-400 font-bold">ID: #EMP-501</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => playSound('waiter_call')} title="Test Waiter Bell Sound" className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-all border border-emerald-500/30">
              🔔 Sound
            </button>
            <button onClick={toggleMute} className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => navigate('/employee')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold shadow-lg shadow-blue-600/10"
          >
            <Coffee className="w-5 h-5 text-blue-400" />
            Live Table POS
          </button>
          
          <button 
            onClick={() => navigate('/employee/complaints')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-900 hover:text-white font-bold border border-transparent hover:border-slate-800"
          >
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Complaints Overview
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="mb-4 px-4 p-2 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Staff Logged In</p>
            <p className="text-xs font-bold text-amber-400">{user?.displayName || 'Alex Rivera'}</p>
            <p className="text-[10px] text-slate-500 font-bold">Staff ID: #EMP-501</p>
          </div>
          <button onClick={() => navigate('/employee/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors mb-2 border border-slate-800/60">
            <User className="w-4 h-4 text-blue-400" />
            My Personal Details & Profile
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20">
            <LogOut className="w-4 h-4" />
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
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-slate-500 hover:text-blue-600">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>
        <div className="w-full h-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
