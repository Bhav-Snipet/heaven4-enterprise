import React from 'react';
import { Outlet } from 'react-router-dom';

export default function KitchenLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-display font-bold text-gold-400">Heaven4 Kitchen</h1>
        {/* Kitchen station selector */}
      </header>
      
      <main className="flex-1 w-full p-4 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
