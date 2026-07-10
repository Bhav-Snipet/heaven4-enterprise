import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { apiClient } from '@/core/api/client';
import toast from 'react-hot-toast';

export default function CustomerCartPage() {
    const { items, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        setIsPlacingOrder(true);
        
        try {
            // Simulated Payment Step
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing
            
            const payload = {
                items: items.map(i => ({
                    menuItemId: i.menuItemId,
                    quantity: i.quantity
                }))
            };
            
            await apiClient.post('/orders', payload);
            
            toast.success('Payment successful! Order placed.');
            clearCart();
            setOrderPlaced(true);
            
        } catch (error) {
            console.error('Order failed', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
                <p className="text-slate-500 mb-8 max-w-md">Your order has been sent to the kitchen. We will notify you when it's ready.</p>
                
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 w-full max-w-md mb-8">
                    <div className="flex items-center justify-center gap-3 text-amber-500 font-semibold text-lg">
                        <Clock className="w-6 h-6" />
                        <span>Estimated time: 15-20 mins</span>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/customer/menu')}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-32">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Your Cart</h1>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-32 text-slate-400">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Trash2 className="w-10 h-10" />
                    </div>
                    <p className="text-lg">Your cart is empty</p>
                </div>
            ) : (
                <div className="p-4 space-y-4">
                    {items.map(item => (
                        <div key={item.menuItemId} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4">
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                            )}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                <p className="font-semibold text-blue-600">${item.price.toFixed(2)}</p>
                                
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                                        <button 
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm font-bold"
                                        >-</button>
                                        <span className="font-semibold w-4 text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm font-bold"
                                        >+</button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.menuItemId)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <span className="text-slate-500 font-medium">Total Amount</span>
                        <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2"
                    >
                        {isPlacingOrder ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Pay & Place Order'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
