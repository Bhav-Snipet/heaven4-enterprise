import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-white shadow-soft hidden md:flex flex-col border-r border-slate-700">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-display font-bold text-heaven-400">Admin Control</h1>
        </div>
        {/* Admin navigation */}
      </aside>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 overflow-y-auto">
        <header className="md:hidden flex justify-between items-center mb-4 bg-slate-900 text-white p-4 shadow rounded-lg">
          <h1 className="text-lg font-bold">Admin Control</h1>
          {/* Mobile menu toggle */}
        </header>
        <Outlet />
      </main>
    </div>
  );
}
