import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Flame, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthProvider';
import { useAudioAlerts } from '@/core/contexts/AudioProvider';

export default function KitchenLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { isMuted, toggleMute, playSound } = useAudioAlerts();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="md:hidden flex justify-between items-center bg-slate-900 border-b border-slate-800 text-white p-4 shadow-sm z-50">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h1 className="text-lg font-bold">Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => playSound('new_order')} className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold">
            🔔 Test Bell
          </button>
          <button onClick={toggleMute} className="text-slate-400 hover:text-white">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>
      
      <main className="flex-1 w-full relative">
        <div className="hidden md:flex items-center gap-3 absolute top-4 right-4 z-50">
           <button onClick={() => playSound('new_order')} className="flex items-center gap-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all backdrop-blur-md">
             🔔 Test Order Sound
           </button>
           <button onClick={toggleMute} className="flex items-center justify-center p-2 bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl transition-colors backdrop-blur-md">
             {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
           </button>
           <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800 border border-white/10 text-slate-300 rounded-xl transition-colors backdrop-blur-md">
             <LogOut className="w-4 h-4" /> Sign Out
           </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
