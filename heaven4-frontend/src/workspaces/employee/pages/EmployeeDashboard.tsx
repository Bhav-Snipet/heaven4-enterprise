import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Coffee } from 'lucide-react';
import apiClient from '@/core/api/client';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';

export default function EmployeeDashboard() {
    const [tables, setTables] = useState<{id: string, status: string, orderTotal: number, orderId?: number}[]>([]);

    const fetchActiveTables = async () => {
        try {
            const res = await apiClient.get('/orders/active');
            const orders = res.data;
            
            // Map real orders to tables
            const activeTablesMap = new Map();
            orders.forEach((order: any) => {
                if (order.tableNumber) {
                    activeTablesMap.set(order.tableNumber, {
                        id: order.tableNumber,
                        status: 'OCCUPIED',
                        orderTotal: order.totalAmount,
                        orderId: order.id
                    });
                }
            });

            // Generate some static tables (1 to 12) + any dynamic ones
            const allTables = [];
            for (let i = 1; i <= 12; i++) {
                const tId = i.toString();
                if (activeTablesMap.has(tId)) {
                    allTables.push(activeTablesMap.get(tId));
                    activeTablesMap.delete(tId);
                } else {
                    allTables.push({ id: tId, status: 'FREE', orderTotal: 0 });
                }
            }
            // Add any takeout or string tables (like "Takeout")
            activeTablesMap.forEach(val => allTables.push(val));

            setTables(allTables);
        } catch (error) {
            console.error("Failed to fetch tables", error);
        }
    };

    useEffect(() => {
        fetchActiveTables();
    }, []);

    useOperationsWebSocket(() => {
        fetchActiveTables();
    });

    const handleCloseTable = async (orderId: number) => {
        try {
            await apiClient.put(`/orders/${orderId}/status`, { status: 'COMPLETED' });
        } catch (error) {
            console.error("Failed to close table", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        Floor POS
                    </h1>
                    <p className="text-slate-500 mt-1">Manage tables and take orders.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all">
                        <Plus className="w-5 h-5" /> New Walk-in Order
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map(table => (
                    <motion.div 
                        key={table.id}
                        whileHover={{ y: -5 }}
                        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                            table.status === 'OCCUPIED' 
                                ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-xl shadow-blue-500/10' 
                                : 'bg-slate-100 dark:bg-slate-800/50 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-2xl font-black ${table.status === 'OCCUPIED' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                T{table.id}
                            </h3>
                            {table.status === 'OCCUPIED' && (
                                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
                                    Seated
                                </div>
                            )}
                        </div>
                        
                        {table.status === 'OCCUPIED' ? (
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Current Bill</p>
                                <p className="text-2xl font-bold">${table.orderTotal.toFixed(2)}</p>
                                <div className="flex gap-2 mt-4">
                                    <button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors">
                                        Add
                                    </button>
                                    <button 
                                        onClick={() => handleCloseTable(table.orderId!)}
                                        className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-500/20"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 opacity-50">
                                <Coffee className="w-8 h-8 text-slate-400 mb-2" />
                                <p className="font-medium text-slate-500">Available</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
