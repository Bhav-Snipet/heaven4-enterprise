import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle2, Clock, Receipt, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';

interface PlacedOrder {
    id: number;
    tableNumber: string;
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    placedAt: string;
}

export default function CustomerCartPage() {
    const { items, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
    const navigate = useNavigate();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
    const [tableNumber, setTableNumber] = useState('');
    const [showBill, setShowBill] = useState(false);
    
    const [tipPercentage, setTipPercentage] = useState(15);
    const taxRate = 0.08;
    const taxAmount = totalAmount * taxRate;
    const tipAmount = totalAmount * (tipPercentage / 100);
    const finalTotal = totalAmount + taxAmount + tipAmount;
    const pointsEarned = Math.floor(finalTotal) * 10;

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        if (!tableNumber.trim()) {
            toast.error('Please enter a table number to place your order.');
            return;
        }
        setIsPlacingOrder(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            
        const orderPayload = {
                tableNumber: tableNumber.trim(),
                // Only send real menu items to the backend — reward items have no real menuItemId
                items: items
                    .filter(i => !i.isReward)
                    .map(i => ({
                        menuItemId: i.menuItemId,
                        quantity: i.quantity
                    }))
            };

            if (orderPayload.items.length === 0) {
                toast.error('Please add at least one regular menu item to your cart.');
                setIsPlacingOrder(false);
                return;
            }
            
            // Re-check item availability (Kitchen Load Mode check)
            try {
                const catalogRes = await apiClient.get('/catalog/full');
                const allItems = Object.values(catalogRes.data.items).flat() as any[];
                for (const item of orderPayload.items) {
                    const found = allItems.find(i => i.id === item.menuItemId);
                    if (found && !found.isAvailable) {
                        toast.error(`Sorry, ${found.name} is currently unavailable due to high kitchen load. Please remove it to proceed.`);
                        setIsPlacingOrder(false);
                        return;
                    }
                }
            } catch (err) {
                // If catalog fetch fails, proceed anyway to not block checkout
            }
            
            
            const orderRes = await apiClient.post('/orders', orderPayload);
            const orderId = orderRes.data.id;
            
            await apiClient.post(`/billing/checkout/${orderId}`, {
                tipAmount: tipAmount.toFixed(2),
                paymentMethod: 'CARD'
            });
            
            // Save bill details before clearing cart
            const placed: PlacedOrder = {
                id: orderId,
                tableNumber: tableNumber.trim(),
                items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
                subtotal: totalAmount,
                tax: taxAmount,
                tip: tipAmount,
                total: finalTotal,
                placedAt: new Date().toLocaleString()
            };
            setPlacedOrder(placed);
            
            toast.success('🎉 Order placed successfully!');
            clearCart();
            setOrderPlaced(true);
            
        } catch (error) {
            console.error('Order failed', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleDownloadBill = () => {
        if (!placedOrder) return;
        let content = `HEAVEN4 RESTAURANT\n`;
        content += `Order Receipt\n`;
        content += `${'='.repeat(35)}\n`;
        content += `Order ID: #${placedOrder.id}\n`;
        content += `Table: ${placedOrder.tableNumber}\n`;
        content += `Date: ${placedOrder.placedAt}\n`;
        content += `${'='.repeat(35)}\n`;
        content += `ITEMS:\n`;
        placedOrder.items.forEach(item => {
            content += `  ${item.quantity}x ${item.name}  $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        content += `${'─'.repeat(35)}\n`;
        content += `Subtotal:  $${placedOrder.subtotal.toFixed(2)}\n`;
        content += `Tax (8%):  $${placedOrder.tax.toFixed(2)}\n`;
        if (placedOrder.tip > 0) content += `Tip:       $${placedOrder.tip.toFixed(2)}\n`;
        content += `${'='.repeat(35)}\n`;
        content += `TOTAL:     $${placedOrder.total.toFixed(2)}\n`;
        content += `\nThank you for dining with us!\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `heaven4_receipt_${placedOrder.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Bill downloaded!');
    };

    if (orderPlaced && placedOrder) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl font-bold mb-2">
                    Order Confirmed!
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="text-slate-500 mb-2 max-w-md">
                    Order <strong>#{placedOrder.id}</strong> for <strong>Table {placedOrder.tableNumber}</strong> is sent to the kitchen.
                </motion.p>
                
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 w-full max-w-md mb-6">
                    <div className="flex items-center justify-center gap-3 text-amber-500 font-semibold text-lg">
                        <Clock className="w-6 h-6" />
                        <span>Estimated time: 15–20 mins</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">We'll bring it right to your table!</p>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex gap-3 w-full max-w-md mb-4">
                    <button onClick={() => navigate('/customer/menu')}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-bold transition-all">
                        ← Back to Menu
                    </button>
                    <button onClick={() => setShowBill(true)}
                        className="flex-1 py-3 bg-white hover:bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                        <Receipt className="w-4 h-4" /> View Bill
                    </button>
                </motion.div>
                <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                    onClick={() => navigate('/customer/rewards')}
                    className="w-full max-w-md py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all">
                    View My Rewards +{pointsEarned} pts
                </motion.button>

                {/* Bill Modal */}
                <AnimatePresence>
                    {showBill && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
                            onClick={() => setShowBill(false)}>
                            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-600"
                                onClick={e => e.stopPropagation()}>
                                
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold">Your Receipt</h3>
                                        <p className="text-sm text-slate-500">Order #{placedOrder.id} · Table {placedOrder.tableNumber}</p>
                                    </div>
                                    <button onClick={() => setShowBill(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {placedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-300">{item.quantity}x {item.name}</span>
                                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${placedOrder.subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-slate-500"><span>Tax (8%)</span><span>${placedOrder.tax.toFixed(2)}</span></div>
                                    {placedOrder.tip > 0 && <div className="flex justify-between text-slate-500"><span>Tip</span><span>${placedOrder.tip.toFixed(2)}</span></div>}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span>Total</span><span>${placedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 text-center mt-4">{placedOrder.placedAt}</p>

                                <button onClick={handleDownloadBill}
                                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                                    <Download className="w-4 h-4" /> Download Receipt
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                <button onClick={() => navigate('/customer/menu')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-full transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-6 h-6" />
                    <span className="font-semibold text-sm">Back to Menu</span>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Cart</h1>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-32 text-slate-400 gap-4">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <Trash2 className="w-10 h-10" />
                    </div>
                    <p className="text-lg">Your cart is empty</p>
                    <button onClick={() => navigate('/customer/menu')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all">
                        Browse Menu
                    </button>
                </div>
            ) : (
                <div className="p-4 space-y-4 max-w-3xl mx-auto">
                    {items.map(item => (
                        <div key={item.menuItemId} className={`p-4 rounded-2xl shadow-sm border flex gap-4 ${item.isReward ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                            )}
                            {!item.imageUrl && item.isReward && (
                                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-3xl">
                                    🎁
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.name}</h3>
                                    {item.isReward && <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">Reward</span>}
                                </div>
                                {item.isReward ? (
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">FREE ✓</p>
                                ) : (
                                    <p className="font-semibold text-blue-600">${item.price.toFixed(2)}</p>
                                )}
                                
                                <div className="flex items-center justify-between mt-3">
                                    {!item.isReward && (
                                        <div className="flex items-center gap-3 bg-slate-200 dark:bg-slate-800 rounded-lg p-1 border border-slate-300 dark:border-slate-600">
                                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-600 text-slate-900 dark:text-white rounded shadow-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors">-</button>
                                            <span className="font-bold w-4 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-600 text-slate-900 dark:text-white rounded shadow-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors">+</button>
                                        </div>
                                    )}
                                    {item.isReward && <span className="text-xs text-slate-500">Qty: {item.quantity}</span>}
                                    <button onClick={() => removeFromCart(item.menuItemId)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Checkout Details (Now in flow, not fixed) */}
                    <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
                        {/* Table Number — REQUIRED */}
                        <div className="mb-6">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                Table Number <span className="text-red-500">*</span>
                                {!tableNumber.trim() && <span className="text-xs text-red-500 font-normal">(Required to place order)</span>}
                            </p>
                            <input 
                                type="text" 
                                placeholder="e.g. 5, 12, VIP-1"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 font-semibold transition-all outline-none"
                            />
                        </div>

                        {/* Tip */}
                        <div className="mb-6">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Add Tip</p>
                            <div className="flex gap-2">
                                {[10, 15, 20].map(pct => (
                                    <button key={pct} onClick={() => setTipPercentage(pct)}
                                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                                            tipPercentage === pct 
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                        }`}>{pct}%</button>
                                ))}
                                <button onClick={() => setTipPercentage(0)}
                                    className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                                        tipPercentage === 0 
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                    }`}>No Tip</button>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 mb-6 text-sm px-1">
                            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${totalAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between text-slate-500"><span>Tax (8%)</span><span>${taxAmount.toFixed(2)}</span></div>
                            {tipAmount > 0 && <div className="flex justify-between text-slate-500"><span>Tip ({tipPercentage}%)</span><span>${tipAmount.toFixed(2)}</span></div>}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Total</span>
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        {/* Points banner */}
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-4 mb-6 flex justify-between items-center border border-amber-200 dark:border-amber-900/50">
                            <span className="text-amber-700 dark:text-amber-400 font-semibold text-sm">✨ Points to earn</span>
                            <span className="font-bold text-amber-600 dark:text-amber-300">+{pointsEarned} pts</span>
                        </div>

                        {/* Buttons */}
                        <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !tableNumber.trim()}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2">
                            {isPlacingOrder ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                tableNumber.trim() ? `Pay & Place Order — $${finalTotal.toFixed(2)}` : 'Enter Table Number First'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
