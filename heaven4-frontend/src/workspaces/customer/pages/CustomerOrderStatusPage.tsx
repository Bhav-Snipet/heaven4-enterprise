import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import { useOperationsWebSocket } from '@/core/hooks/useOperationsWebSocket';

interface OrderItem {
    menuItemId: number;
    menuItemName: string;
    quantity: number;
    unitPrice: number;  // correct field name from backend
    subtotal: number;
}

interface OrderDto {
    id: number;
    tableNumber: string;
    status: string;
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
}

export default function CustomerOrderStatusPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/orders/my-orders');
            // Filter to show active orders, or maybe all but sort active first
            setOrders(res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Failed to fetch orders", error);
            toast.error("Could not load your orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useOperationsWebSocket(() => {
        fetchOrders();
    });

    const handleRaiseComplaint = (order: OrderDto) => {
        navigate('/customer/complaint', { state: { orderId: order.id, tableNumber: order.tableNumber } });
    };

    const handleLeaveReview = (orderId: number) => {
        setSelectedOrder(orderId);
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!selectedOrder) return;
        try {
            await apiClient.post('/reviews', { orderId: selectedOrder, rating, comment });
            toast.success("Thank you for your feedback!");
            setShowReviewModal(false);
        } catch (e) {
            toast.error("Failed to submit review.");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
            case 'PREPARING': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
            case 'READY': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
            case 'COMPLETED': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
            default: return 'bg-slate-500/20 text-slate-500 border-slate-500/50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Track Order</h1>
                </div>
                <button onClick={fetchOrders} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                </button>
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-6 mt-4">
                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading your orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <p>No orders found.</p>
                        <button onClick={() => navigate('/customer/menu')} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Browse Menu</button>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 overflow-hidden relative">
                            {/* Status Banner */}
                            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                                <div>
                                    <p className="text-sm text-slate-500 font-semibold mb-1">Order #{order.id}</p>
                                    <h2 className="text-xl font-bold dark:text-white">Table {order.tableNumber}</h2>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full border text-sm font-bold capitalize ${getStatusColor(order.status)}`}>
                                    {order.status.toLowerCase()}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-3 mb-6">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                                        <span><span className="font-bold text-slate-900 dark:text-white mr-2">{item.quantity}×</span> {item.menuItemName}</span>
                                        <span className="font-medium text-slate-900 dark:text-white">${(item.subtotal || item.unitPrice * item.quantity || 0).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-4 mb-6">
                                <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                                <span className="font-black text-2xl text-slate-900 dark:text-white">${(order.totalAmount || 0).toFixed(2)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                {order.status === 'COMPLETED' ? (
                                    <button 
                                        onClick={() => handleLeaveReview(order.id)}
                                        className="flex-1 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" /> Leave Review
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleRaiseComplaint(order)}
                                            className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                        >
                                            <AlertTriangle className="w-5 h-5" /> Raise Complaint
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 relative">
                        <h2 className="text-2xl font-bold mb-2">How was your meal?</h2>
                        <p className="text-slate-500 mb-6">Please rate your experience for Order #{selectedOrder}</p>
                        
                        <div className="flex justify-between mb-6">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setRating(star)} className="text-4xl transition-transform hover:scale-110">
                                    {star <= rating ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>

                        <textarea 
                            className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 mb-6 min-h-[100px] outline-none"
                            placeholder="Tell us what you liked or what we can improve..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 rounded-xl">Cancel</button>
                            <button onClick={submitReview} className="flex-1 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30">Submit Review</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
