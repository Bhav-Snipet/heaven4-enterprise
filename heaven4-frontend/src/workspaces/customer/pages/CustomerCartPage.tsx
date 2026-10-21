import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle2, Clock, Receipt, Download, X, AlertTriangle, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import apiClient from '@/core/api/client';
import toast from 'react-hot-toast';
import { isValidTableNumber, getTableConfig } from '@/shared/utils/tableHelpers';
import { loadCatalogFromStorage } from '@/shared/utils/catalogData';
import { Coupon, CouponUsage, loadMasterCoupons, loadUsageHistory, saveUsageHistory } from '@/workspaces/owner/pages/OwnerCouponsPage';

interface PlacedOrder {
    id: number;
    tableNumber: string;
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    discount?: number;
    couponCode?: string;
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
    const [tableNumber, setTableNumber] = useState(localStorage.getItem('heaven4_table_number') || '');
    const [tableValidationError, setTableValidationError] = useState<string>('');
    const [showBill, setShowBill] = useState(false);
    
    const [tipPercentage, setTipPercentage] = useState(15);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>(() => loadMasterCoupons());

    useEffect(() => {
        const local = loadMasterCoupons();
        setAvailableCoupons(local);

        apiClient.get('/owner/coupons', { headers: { 'x-suppress-error-toast': 'true' } })
            .then(res => {
                if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
                    setAvailableCoupons(res.data.filter((c: any) => c.isActive !== false));
                }
            })
            .catch(() => { /* use master local coupons */ });

        const handleCouponsUpdated = (e: any) => {
            if (e.detail && Array.isArray(e.detail)) {
                setAvailableCoupons(e.detail);
            } else {
                setAvailableCoupons(loadMasterCoupons());
            }
        };

        window.addEventListener('heaven4-coupons-updated', handleCouponsUpdated);
        window.addEventListener('storage', handleCouponsUpdated);
        return () => {
            window.removeEventListener('heaven4-coupons-updated', handleCouponsUpdated);
            window.removeEventListener('storage', handleCouponsUpdated);
        };
    }, []);

    // Reactive Rule Enforcement: If cart total drops below min spend requirement, auto-remove coupon
    // CRITICAL: Must not trigger when items are 0 (cart cleared upon order completion) or order is placed/placing
    useEffect(() => {
        if (orderPlaced || isPlacingOrder || items.length === 0) return;

        if (appliedCoupon && (appliedCoupon.minOrderAmount || 0) > 0) {
            if (totalAmount > 0 && totalAmount < (appliedCoupon.minOrderAmount || 0)) {
                const req = (appliedCoupon.minOrderAmount || 0).toFixed(2);
                toast.error(
                    `⚠️ Coupon "${appliedCoupon.code}" removed: cart subtotal ($${totalAmount.toFixed(2)}) is below the $${req} minimum spend requirement.`,
                    { id: 'min-spend-dropped', duration: 4500 }
                );
                setAppliedCoupon(null);
            }
        }
    }, [totalAmount, appliedCoupon, items.length, orderPlaced, isPlacingOrder]);

    const taxRate = 0.08;
    const rawDiscount = appliedCoupon ? totalAmount * appliedCoupon.discountPercentage : 0;
    const discountAmount = (appliedCoupon && appliedCoupon.maxDiscountAmount && appliedCoupon.maxDiscountAmount > 0)
        ? Math.min(rawDiscount, appliedCoupon.maxDiscountAmount)
        : rawDiscount;
    const isDiscountCapped = Boolean(appliedCoupon && appliedCoupon.maxDiscountAmount && rawDiscount > appliedCoupon.maxDiscountAmount);

    const discountedSubtotal = Math.max(0, totalAmount - discountAmount);
    const taxAmount = discountedSubtotal * taxRate;
    const tipAmount = discountedSubtotal * (tipPercentage / 100);
    const finalTotal = discountedSubtotal + taxAmount + tipAmount;
    const pointsEarned = Math.floor(finalTotal) * 10;

    const validateCouponCode = (code: string, currentTotal: number): { valid: boolean; coupon?: Coupon; error?: string } => {
        const clean = code.trim().toUpperCase();
        if (!clean) {
            return { valid: false, error: 'Please enter a coupon code.' };
        }

        const masterList = loadMasterCoupons();
        const found = masterList.find(c => c.code.toUpperCase() === clean) ||
                      availableCoupons.find(c => c.code.toUpperCase() === clean);

        if (!found) {
            return { valid: false, error: `Coupon code "${clean}" does not exist or is invalid.` };
        }

        // Rule 1: Active check
        if (found.isActive === false) {
            return { valid: false, error: `Coupon "${found.code}" is currently deactivated or suspended.` };
        }

        // Rule 2: Expiration check
        if (found.validUntil) {
            const expiry = new Date(found.validUntil);
            expiry.setHours(23, 59, 59, 999);
            if (new Date() > expiry) {
                return { valid: false, error: `Coupon "${found.code}" expired on ${found.validUntil}.` };
            }
        }

        // Rule 3: Minimum spend requirement
        const minSpend = Number(found.minOrderAmount) || 0;
        if (minSpend > 0 && currentTotal < minSpend) {
            const diff = (minSpend - currentTotal).toFixed(2);
            return {
                valid: false,
                error: `Minimum spend of $${minSpend.toFixed(2)} required for "${found.code}". (Current cart: $${currentTotal.toFixed(2)}. Add $${diff} more!)`
            };
        }

        // Rule 4: Usage limit per customer
        const currentUserName = localStorage.getItem('heaven4_user_name') || 'Dine-in Customer';
        const currentUserPhone = localStorage.getItem('heaven4_user_phone') || '';
        const usageHistory = loadUsageHistory();

        if (found.usageLimitPerCustomer && found.usageLimitPerCustomer > 0) {
            const customerCount = usageHistory.filter(u =>
                u.couponCode.toUpperCase() === found.code.toUpperCase() &&
                (
                    (currentUserPhone && u.userPhone && u.userPhone === currentUserPhone) ||
                    (u.userName && u.userName.toLowerCase() === currentUserName.toLowerCase())
                )
            ).length;

            if (customerCount >= found.usageLimitPerCustomer) {
                return {
                    valid: false,
                    error: `You have reached your limit of ${found.usageLimitPerCustomer} redemption(s) for "${found.code}".`
                };
            }
        }

        // Rule 5: Total usage limit
        if (found.totalUsageLimit && found.totalUsageLimit > 0) {
            const totalRedemptions = usageHistory.filter(u =>
                u.couponCode.toUpperCase() === found.code.toUpperCase()
            ).length;

            if (totalRedemptions >= found.totalUsageLimit) {
                return {
                    valid: false,
                    error: `Coupon "${found.code}" has reached its maximum total redemptions limit (${found.totalUsageLimit}).`
                };
            }
        }

        return { valid: true, coupon: found };
    };

    const handleApplyCoupon = (codeToApply?: string) => {
        const code = (codeToApply || couponCodeInput).trim().toUpperCase();
        const check = validateCouponCode(code, totalAmount);
        if (!check.valid || !check.coupon) {
            toast.error(check.error || 'Invalid coupon code', { duration: 5000 });
            return;
        }

        const found = check.coupon;
        setAppliedCoupon(found);
        setCouponCodeInput(found.code);

        const rawVal = totalAmount * found.discountPercentage;
        const capped = Boolean(found.maxDiscountAmount && rawVal > found.maxDiscountAmount);
        const actualVal = capped ? (found.maxDiscountAmount as number) : rawVal;

        toast.success(
            `🎉 Coupon "${found.code}" applied! ${Math.round(found.discountPercentage * 100)}% discount${capped ? ` (Capped at $${found.maxDiscountAmount?.toFixed(2)})` : ''}. Saving $${actualVal.toFixed(2)}!`
        );
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCodeInput('');
        toast.success('Coupon removed.');
    };

    // Validate table on input change
    useEffect(() => {
        if (!tableNumber.trim()) {
            setTableValidationError('⚠️ Table number is required to place your order.');
            return;
        }
        const clean = tableNumber.trim().toUpperCase();
        if (!isValidTableNumber(clean)) {
            setTableValidationError(`❌ Invalid Table "${clean}"! Please enter a valid table (e.g. B-1..4, T-1..14, VIP-1..5).`);
        } else {
            setTableValidationError('');
            localStorage.setItem('heaven4_table_number', clean);
        }
    }, [tableNumber]);

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;
        const normalizedTable = tableNumber.trim().toUpperCase();
        if (!normalizedTable) {
            toast.error('Please enter a valid table number to place your order.');
            return;
        }
        if (!isValidTableNumber(normalizedTable)) {
            toast.error(`❌ Table "${normalizedTable}" does not exist in restaurant layout!`);
            return;
        }

        // ── STRICT COUPON VALIDATION BEFORE ORDER PLACEMENT ──
        // If a coupon code was typed or applied, verify ALL rules before placing order.
        // If any rule fails, the order MUST NOT be placed without discount!
        let couponForOrder: Coupon | null = appliedCoupon;
        const enteredCode = couponCodeInput.trim().toUpperCase();

        if (enteredCode) {
            const check = validateCouponCode(enteredCode, totalAmount);
            if (!check.valid || !check.coupon) {
                toast.error(`❌ Coupon cannot be applied: ${check.error || 'Invalid code'}. Order was NOT placed.`, { duration: 6000 });
                return;
            }
            couponForOrder = check.coupon;
            setAppliedCoupon(check.coupon);
        } else if (appliedCoupon) {
            const check = validateCouponCode(appliedCoupon.code, totalAmount);
            if (!check.valid || !check.coupon) {
                toast.error(`❌ Coupon cannot be applied: ${check.error}. Order was NOT placed.`, { duration: 6000 });
                return;
            }
            couponForOrder = check.coupon;
        }

        // Compute discount using verified coupon
        const orderRawDiscount = couponForOrder ? totalAmount * couponForOrder.discountPercentage : 0;
        const orderDiscountAmount = (couponForOrder && couponForOrder.maxDiscountAmount && couponForOrder.maxDiscountAmount > 0)
            ? Math.min(orderRawDiscount, couponForOrder.maxDiscountAmount)
            : orderRawDiscount;
        const orderDiscountedSubtotal = Math.max(0, totalAmount - orderDiscountAmount);
        const orderTaxAmount = orderDiscountedSubtotal * taxRate;
        const orderTipAmount = orderDiscountedSubtotal * (tipPercentage / 100);
        const orderFinalTotal = orderDiscountedSubtotal + orderTaxAmount + orderTipAmount;

        setIsPlacingOrder(true);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            
            const orderPayload = {
                tableNumber: normalizedTable,
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
            
            try {
                let allItems: any[] = [];
                try {
                    const catalogRes = await apiClient.get('/catalog/full', { headers: { 'x-suppress-error-toast': 'true' } });
                    if (catalogRes?.data?.items) {
                        allItems = Object.values(catalogRes.data.items).flat() as any[];
                    }
                } catch { /* proceed with local storage */ }

                if (allItems.length === 0) {
                    const localData = loadCatalogFromStorage();
                    allItems = Object.values(localData.itemsMap).flat();
                }

                for (const item of orderPayload.items) {
                    const found = allItems.find(i => i.id === item.menuItemId);
                    if (found && found.isAvailable === false) {
                        toast.error(`Sorry, ${found.name} is currently sold out. Please remove it from your cart.`);
                        setIsPlacingOrder(false);
                        return;
                    }
                }
            } catch {
                /* proceed with checkout */
            }
            
            const orderRes = await apiClient.post('/orders', orderPayload, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => ({ data: { id: Math.floor(100000 + Math.random() * 900000) } }));
            const orderId = orderRes.data?.id || Math.floor(100000 + Math.random() * 900000);
            
            await apiClient.post(`/billing/checkout/${orderId}`, {
                tipAmount: orderTipAmount.toFixed(2),
                paymentMethod: 'CARD'
            }, { headers: { 'x-suppress-error-toast': 'true' } }).catch(() => null);
            
            const placed = {
                id: orderId,
                tableNumber: normalizedTable,
                customerName: localStorage.getItem('heaven4_user_name') || 'Dine-in Customer',
                status: 'PENDING',
                orderStatus: 'PENDING',
                items: items.map(i => ({
                    menuItemId: i.menuItemId,
                    menuItemName: i.name,
                    name: i.name,
                    quantity: i.quantity,
                    unitPrice: i.price,
                    price: i.price,
                    subtotal: i.price * i.quantity
                })),
                subtotal: totalAmount,
                discount: orderDiscountAmount > 0 ? orderDiscountAmount : undefined,
                couponCode: couponForOrder ? couponForOrder.code : undefined,
                tax: orderTaxAmount,
                tip: orderTipAmount,
                total: orderFinalTotal,
                totalAmount: orderFinalTotal,
                createdAt: new Date().toISOString(),
                placedAt: new Date().toISOString()
            };
            setPlacedOrder(placed as any);

            // Record coupon usage in ledger
            if (couponForOrder && orderDiscountAmount > 0) {
                const couponUsage: CouponUsage = {
                    id: `usage-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    couponCode: couponForOrder.code,
                    userName: localStorage.getItem('heaven4_user_name') || 'Dine-in Customer',
                    userPhone: localStorage.getItem('heaven4_user_phone') || '+91 98765 43210',
                    orderId: orderId,
                    orderTotal: totalAmount,
                    discountAmount: parseFloat(orderDiscountAmount.toFixed(2)),
                    usedAt: new Date().toISOString()
                };
                try {
                    const currentHistory = loadUsageHistory();
                    saveUsageHistory([couponUsage, ...currentHistory]);
                    window.dispatchEvent(new CustomEvent('heaven4-coupon-used', { detail: couponUsage }));
                } catch (e) {
                    console.error("Coupon usage tracking error", e);
                }
            }

            // Sync order across all open windows & dashboards instantly (Kitchen, Employee, Tracking)
            try {
                const existingActiveRaw = localStorage.getItem('heaven4_active_orders_v2');
                const existingActive = existingActiveRaw ? JSON.parse(existingActiveRaw) : [];
                const updatedActive = [placed, ...(Array.isArray(existingActive) ? existingActive : [])];
                localStorage.setItem('heaven4_active_orders_v2', JSON.stringify(updatedActive));

                const existingPlacedRaw = localStorage.getItem('heaven4_placed_orders');
                const existingPlaced = existingPlacedRaw ? JSON.parse(existingPlacedRaw) : [];
                const updatedPlaced = [placed, ...(Array.isArray(existingPlaced) ? existingPlaced : [])];
                localStorage.setItem('heaven4_placed_orders', JSON.stringify(updatedPlaced));

                window.dispatchEvent(new CustomEvent('heaven4-order-placed', { detail: placed }));
                window.dispatchEvent(new Event('storage'));
            } catch (e) {
                console.error("Order local sync failed", e);
            }
            
            // Mark order as placed BEFORE clearing cart so reactive listener never drops coupon
            setOrderPlaced(true);
            clearCart();
            toast.success('🎉 Order placed successfully!');
            
        } catch {
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleDownloadBill = () => {
        if (!placedOrder) return;
        let content = `HEAVEN4 RESTAURANT & LOUNGE\n`;
        content += `Official Order Tax Receipt\n`;
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
        if (placedOrder.discount && placedOrder.discount > 0) {
            content += `Discount (${placedOrder.couponCode || 'Promo'}): -$${placedOrder.discount.toFixed(2)}\n`;
        }
        content += `Tax (8%):  $${placedOrder.tax.toFixed(2)}\n`;
        if (placedOrder.tip > 0) content += `Tip:       $${placedOrder.tip.toFixed(2)}\n`;
        content += `${'='.repeat(35)}\n`;
        content += `TOTAL:     $${placedOrder.total.toFixed(2)}\n`;
        content += `\nThank you for dining at Heaven4!\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `heaven4_receipt_${placedOrder.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Bill downloaded!');
    };

    const selectedTableCfg = tableNumber.trim() ? getTableConfig(tableNumber.trim()) : undefined;

    if (orderPlaced && placedOrder) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl font-black mb-2 text-white">
                    Order Confirmed!
                </motion.h2>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="text-slate-400 mb-6 max-w-md text-sm">
                    Order <strong className="text-amber-400">#{placedOrder.id}</strong> for <strong className="text-amber-400">Table {placedOrder.tableNumber}</strong> has been transmitted to the kitchen.
                </motion.p>
                
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                    className="bg-slate-900 p-5 rounded-3xl border border-slate-800 w-full max-w-md mb-6 shadow-2xl">
                    <div className="flex items-center justify-center gap-3 text-amber-400 font-black text-lg">
                        <Clock className="w-6 h-6 text-amber-400" />
                        <span>Estimated Preparation: 15–20 Mins</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Our service staff will bring your dishes directly to Table {placedOrder.tableNumber}.</p>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="flex flex-col gap-3 w-full max-w-md mb-4">
                    
                    {/* Direct Track Order Button */}
                    <button onClick={() => navigate('/customer/order-status')}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                        <Clock className="w-4 h-4 text-white" /> Track Order Status Live →
                    </button>

                    <div className="flex gap-3 w-full">
                        <button onClick={() => navigate('/customer/menu')}
                            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs border border-slate-800 transition-all">
                            ← Back to Menu
                        </button>
                        <button onClick={() => setShowBill(true)}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
                            <Receipt className="w-4 h-4" /> View Tax Receipt
                        </button>
                    </div>

                    <button onClick={() => navigate('/customer/rewards')}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" /> View Rewards Wallet (+{pointsEarned} pts)
                    </button>

                    {/* Direct Raise Complaint Button */}
                    <button onClick={() => navigate('/customer/complaint', { state: { orderId: placedOrder.id, tableNumber: placedOrder.tableNumber } })}
                        className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" /> Need Help? Raise Complaint for Order #{placedOrder.id}
                    </button>
                </motion.div>
                
                {/* Dark Receipt Modal */}
                <AnimatePresence>
                    {showBill && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
                            onClick={() => setShowBill(false)}>
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-white relative"
                                onClick={e => e.stopPropagation()}>
                                
                                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                                    <div>
                                        <h3 className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                                            TAX RECEIPT / BILL
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold mt-0.5">Order #{placedOrder.id} · Table {placedOrder.tableNumber}</p>
                                    </div>
                                    <button onClick={() => setShowBill(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-2 mb-4 text-xs font-semibold max-h-48 overflow-y-auto pr-1">
                                    {placedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                                            <span className="text-slate-300">{item.quantity}× {item.name}</span>
                                            <span className="font-black text-amber-400">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs font-medium">
                                    <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>${placedOrder.subtotal.toFixed(2)}</span></div>
                                    {placedOrder.discount && placedOrder.discount > 0 && (
                                        <div className="flex justify-between text-emerald-400 font-bold">
                                            <span>Coupon Discount ({placedOrder.couponCode || 'Promo'})</span>
                                            <span>-${placedOrder.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-slate-400"><span>Tax (8%)</span><span>${placedOrder.tax.toFixed(2)}</span></div>
                                    {placedOrder.tip > 0 && <div className="flex justify-between text-slate-400"><span>Staff Tip</span><span>${placedOrder.tip.toFixed(2)}</span></div>}
                                    
                                    <div className="flex justify-between text-base font-black text-emerald-400 pt-3 border-t border-slate-800">
                                        <span>TOTAL PAID</span>
                                        <span>${placedOrder.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-dashed border-slate-800 text-center">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Thank you for dining at Heaven4!</p>
                                </div>
                                
                                <button onClick={handleDownloadBill}
                                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
                                    <Download className="w-4 h-4" /> Download Receipt Text
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-16">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between max-w-4xl mx-auto">
                <button onClick={() => navigate('/customer/menu')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors flex items-center gap-2 px-4 py-2 border border-slate-700 text-xs font-bold">
                    <ArrowLeft className="w-4 h-4" /> Back to Menu
                </button>
                <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">Your Order Cart</h1>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-32 text-slate-400 gap-4">
                    <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-amber-400">
                        <Trash2 className="w-10 h-10" />
                    </div>
                    <p className="text-base font-bold text-slate-300">Your shopping cart is currently empty</p>
                    <button onClick={() => navigate('/customer/menu')}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20">
                        Browse Full Culinary Menu
                    </button>
                </div>
            ) : (
                <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
                    {items.map(item => (
                        <div key={item.menuItemId} className={`p-4 rounded-3xl border flex gap-4 ${item.isReward ? 'bg-amber-950/30 border-amber-500/40' : 'bg-slate-900 border-slate-800'}`}>
                            {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-2xl border border-slate-800" />
                            )}
                            {!item.imageUrl && item.isReward && (
                                <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-3xl">
                                    🎁
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="font-bold text-base text-white">{item.name}</h3>
                                    {item.isReward && <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">Reward Freebie</span>}
                                </div>
                                {item.isReward ? (
                                    <p className="font-black text-xs text-emerald-400">FREE ✓</p>
                                ) : (
                                    <p className="font-black text-sm text-amber-400">${item.price.toFixed(2)}</p>
                                )}
                                
                                <div className="flex items-center justify-between mt-3">
                                    {!item.isReward && (
                                        <div className="flex items-center gap-3 bg-slate-950 rounded-xl p-1 border border-slate-800">
                                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors text-xs border border-slate-700">-</button>
                                            <span className="font-black text-xs w-4 text-center text-amber-400">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors text-xs border border-slate-700">+</button>
                                        </div>
                                    )}
                                    {item.isReward && <span className="text-xs text-slate-400 font-semibold">Qty: {item.quantity}</span>}
                                    <button onClick={() => removeFromCart(item.menuItemId)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Checkout Details Box */}
                    <div className="mt-8 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                        
                        {/* Table Number Input with Strict Validation */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    Dining Table Number <span className="text-red-400">*</span>
                                </label>
                                {selectedTableCfg && (
                                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Table {selectedTableCfg.tableNumber} ({selectedTableCfg.categoryLabel} · {selectedTableCfg.capacity} seats)
                                    </span>
                                )}
                            </div>
                            <input 
                                type="text" 
                                placeholder="Enter Table No. (e.g. T-1, T-5, B-1, VIP-1)"
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                className={`w-full p-4 rounded-2xl bg-slate-950 text-white font-black text-base border outline-none transition-all placeholder:text-slate-600 ${
                                    tableValidationError ? 'border-red-500 focus:border-red-400' : 'border-slate-800 focus:border-amber-500'
                                }`}
                            />
                            {tableValidationError ? (
                                <p className="text-xs font-bold text-red-400 mt-2 flex items-center gap-1.5 p-2 bg-red-500/10 rounded-xl border border-red-500/30">
                                    <AlertTriangle className="w-4 h-4 shrink-0" /> {tableValidationError}
                                </p>
                            ) : (
                                <p className="text-[10px] text-slate-500 mt-1">Valid registered tables: B-1..B-4 (Bar), T-1..T-14 (Dining), VIP-1..VIP-5 (Lounge).</p>
                            )}
                        </div>

                        {/* Tip Selector */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Staff Gratuity / Tip</p>
                            <div className="flex gap-2">
                                {[10, 15, 20].map(pct => (
                                    <button key={pct} onClick={() => setTipPercentage(pct)}
                                        className={`flex-1 py-2.5 rounded-xl font-black text-xs border transition-all ${
                                            tipPercentage === pct 
                                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                        }`}>{pct}%</button>
                                ))}
                                <button onClick={() => setTipPercentage(0)}
                                    className={`flex-1 py-2.5 rounded-xl font-black text-xs border transition-all ${
                                        tipPercentage === 0 
                                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                    }`}>No Tip</button>
                            </div>
                        </div>

                        {/* Promotional Coupon Section with Rules Engine */}
                        <div className="border-t border-slate-800/80 pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-amber-400" /> Apply Coupon Code
                                </label>
                                {appliedCoupon && (
                                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> {appliedCoupon.code} ({Math.round(appliedCoupon.discountPercentage * 100)}% OFF)
                                    </span>
                                )}
                            </div>

                            {appliedCoupon ? (
                                <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-950/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg">
                                            🎟️
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-black text-emerald-300">{appliedCoupon.code} Active</p>
                                                {isDiscountCapped && (
                                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.2 rounded-full font-bold">
                                                        🛡️ Capped at ${appliedCoupon.maxDiscountAmount?.toFixed(2)}
                                                    </span>
                                                )}
                                                {appliedCoupon.minOrderAmount && appliedCoupon.minOrderAmount > 0 && (
                                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 rounded-full font-bold">
                                                        ✓ Min ${appliedCoupon.minOrderAmount.toFixed(0)} Met
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                                Saving <strong className="text-emerald-400">${discountAmount.toFixed(2)}</strong> on this order
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl border border-red-500/30 transition-all">
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code (e.g. WELCOME20, SUMMERFEAST)"
                                            value={couponCodeInput}
                                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            className="flex-1 p-3 rounded-xl bg-slate-950 text-white font-bold text-xs border border-slate-800 focus:border-amber-500 outline-none uppercase tracking-wider placeholder:normal-case placeholder:text-slate-600"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleApplyCoupon()}
                                            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1.5">
                                            Apply
                                        </button>
                                    </div>
                                    {/* Quick suggested coupon badges with rule cues */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {availableCoupons.filter(c => c.isActive !== false).map(c => {
                                            const minSpend = c.minOrderAmount || 0;
                                            const qualifies = totalAmount >= minSpend;
                                            const missing = (minSpend - totalAmount).toFixed(0);

                                            return (
                                                <button
                                                    key={c.code}
                                                    type="button"
                                                    onClick={() => handleApplyCoupon(c.code)}
                                                    className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                                                        qualifies
                                                            ? 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-amber-500/40 shadow-sm'
                                                            : 'bg-slate-950/60 hover:bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                                                    }`}>
                                                    <span>🏷️</span>
                                                    <span>{c.code} ({Math.round(c.discountPercentage * 100)}% off)</span>
                                                    {minSpend > 0 && (
                                                        <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold ${
                                                            qualifies 
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                                : 'bg-amber-500/10 text-amber-400/80 border border-amber-500/20'
                                                        }`}>
                                                            {qualifies ? `Min $${minSpend.toFixed(0)} ✓` : `Needs +$${missing}`}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Summary */}
                        <div className="space-y-2 text-xs border-t border-slate-800 pt-4">
                            <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>${totalAmount.toFixed(2)}</span></div>
                            {discountAmount > 0 && (
                                <div>
                                    <div className="flex justify-between text-emerald-400 font-bold">
                                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                    {isDiscountCapped && (
                                        <p className="text-[10px] text-amber-400 text-right mt-0.5 font-semibold">
                                            (Capped at maximum discount limit of ${appliedCoupon?.maxDiscountAmount?.toFixed(2)})
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-between text-slate-400"><span>Tax (8%)</span><span>${taxAmount.toFixed(2)}</span></div>
                            {tipAmount > 0 && <div className="flex justify-between text-slate-400"><span>Tip ({tipPercentage}%)</span><span>${tipAmount.toFixed(2)}</span></div>}
                            <div className="pt-3 border-t border-slate-800 flex justify-between items-end">
                                <span className="text-slate-300 font-bold text-sm">TOTAL AMOUNT</span>
                                <span className="text-2xl font-black text-amber-400">${finalTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        {/* Points banner */}
                        <div className="bg-gradient-to-r from-amber-950/60 to-purple-950/60 rounded-2xl p-3 flex justify-between items-center border border-amber-500/30">
                            <span className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-400" /> VIP Points to Earn
                            </span>
                            <span className="font-black text-amber-400 text-sm">+{pointsEarned} pts</span>
                        </div>

                        {/* Pay Button */}
                        <button onClick={handlePlaceOrder} disabled={isPlacingOrder || !tableNumber.trim() || !!tableValidationError}
                            className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-2xl font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex justify-center items-center gap-2">
                            {isPlacingOrder ? (
                                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                tableValidationError ? 'Fix Table Number Error' : tableNumber.trim() ? `Confirm & Place Order — $${finalTotal.toFixed(2)}` : 'Enter Valid Table Number First'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
