import React from 'react';
import { Outlet } from 'react-router-dom';

export default function OwnerLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-black shadow-soft hidden md:flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-display font-bold text-gold-400">Heaven4 HQ</h1>
        </div>
        {/* Owner navigation */}
      </aside>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto">
        <header className="md:hidden flex justify-between items-center mb-4 bg-black text-white p-4 shadow rounded-lg border border-slate-800">
          <h1 className="text-lg font-bold text-gold-400">Heaven4 HQ</h1>
          {/* Mobile menu toggle */}
        </header>
        <Outlet />
      </main>
    </div>
  );
}
