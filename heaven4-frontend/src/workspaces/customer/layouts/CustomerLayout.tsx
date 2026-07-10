import React from 'react';
import { Outlet } from 'react-router-dom';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="bg-white dark:bg-slate-800 shadow-soft p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-display font-bold text-heaven-600 dark:text-heaven-400">Heaven4</h1>
        {/* Customer navigation items will go here */}
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>
      
      {/* Mobile bottom navigation will go here */}
    </div>
  );
}
