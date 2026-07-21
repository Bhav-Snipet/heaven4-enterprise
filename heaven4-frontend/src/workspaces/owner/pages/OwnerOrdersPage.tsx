import { useState, useEffect } from 'react';
import { Search, Download, Calendar, ArrowRight, X, ShoppingBag } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface OrderDto {
    id: number;
    tableNumber: string;
    status: string;
    totalAmount: number;
    discountAmount?: number;
    items: { menuItemName: string; quantity: number; subtotal?: number; unitPrice?: number }[];
    createdAt: string;
    customerName: string;
}

export default function OwnerOrdersPage() {
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await apiClient.get('/orders/all');
                setOrders(res.data);
            } catch (e) {
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const filtered = orders.filter(o => 
        o.id.toString().includes(search) || 
        o.tableNumber?.includes(search) ||
        o.customerName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = () => {
        const csv = [
            ['Order ID', 'Date', 'Table', 'Customer', 'Status', 'Total', 'Items'],
            ...filtered.map(o => [
                o.id,
                new Date(o.createdAt).toLocaleString(),
                o.tableNumber || '-',
                o.customerName || '-',
                o.status,
                o.totalAmount.toFixed(2),
                o.items.map(i => `${i.quantity}x ${i.menuItemName}`).join('; ')
            ])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gold-400">Order History</h1>
                    <p className="text-slate-400 mt-1">Global view of all transactions</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-gold-500 outline-none w-64 text-white"
                        />
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors font-semibold">
                        <Download className="w-5 h-5" /> Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/50 border-b border-slate-800">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-400">Order ID</th>
                                    <th className="p-4 font-semibold text-slate-400">Date &amp; Time</th>
                                    <th className="p-4 font-semibold text-slate-400">Table</th>
                                    <th className="p-4 font-semibold text-slate-400">Customer</th>
                                    <th className="p-4 font-semibold text-slate-400">Status</th>
                                    <th className="p-4 font-semibold text-slate-400">Total</th>
                                    <th className="p-4 font-semibold text-slate-400">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filtered.map(order => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-bold">#{order.id}</td>
                                        <td className="p-4 text-slate-400 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td className="p-4">{order.tableNumber || '-'}</td>
                                        <td className="p-4 text-slate-300">{order.customerName || '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gold-400">${(order.totalAmount || 0).toFixed(2)}</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group-hover:text-gold-400"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">No orders found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gold-400">Order #{selectedOrder.id}</h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Table {selectedOrder.tableNumber || '—'} · {selectedOrder.customerName || 'Guest'}
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-800 rounded-full">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="bg-black/30 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <ShoppingBag className="w-4 h-4 text-slate-400" />
                                <h3 className="font-semibold text-slate-300 text-sm uppercase tracking-wider">Items</h3>
                            </div>
                            <div className="space-y-2">
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-300">{item.quantity}× {item.menuItemName}</span>
                                        <span className="text-white font-semibold">${(item.subtotal || (item.unitPrice || 0) * item.quantity || 0).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm border-t border-slate-800 pt-4">
                            {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                    <span>Discount Applied</span>
                                    <span>-${selectedOrder.discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold text-white pt-2">
                                <span>Total</span>
                                <span className="text-gold-400">${(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-center mt-4">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                                    selectedOrder.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                    selectedOrder.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>{selectedOrder.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
