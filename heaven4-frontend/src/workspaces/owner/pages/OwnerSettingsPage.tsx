import { useState } from 'react';
import { Settings, Save, CreditCard, QrCode, Upload, Link2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loadPaymentSettings, savePaymentSettings, PaymentSettings } from '@/shared/utils/eventHelpers';

export default function OwnerSettingsPage() {
    const [generalSaved, setGeneralSaved] = useState(false);

    // Payment Settings State
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(loadPaymentSettings());
    const [showAccountNumber, setShowAccountNumber] = useState(false);
    const [qrInputMode, setQrInputMode] = useState<'url' | 'upload'>('url');
    const [paymentSaving, setPaymentSaving] = useState(false);

    const updatePayment = (key: keyof PaymentSettings, value: string) => {
        setPaymentSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSavePayment = () => {
        setPaymentSaving(true);
        setTimeout(() => {
            savePaymentSettings(paymentSettings);
            setPaymentSaving(false);
            toast.success('💳 Payment settings saved! All event booking pages updated.');
        }, 600);
    };

    const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (PNG, JPG, etc.)');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            updatePayment('paymentQrUrl', reader.result as string);
            toast.success('QR code image loaded!');
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-amber-400">Global Settings</h1>
                <p className="text-slate-400 mt-1">Configure restaurant-wide preferences and payment infrastructure</p>
            </div>

            {/* ── General Configuration ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-800 pb-4 text-white">
                    <Settings className="w-5 h-5 text-amber-400" /> General Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Restaurant Name</label>
                        <input type="text" defaultValue="Heaven4 Enterprise" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Tax Rate (%)</label>
                        <input type="number" defaultValue="8.0" step="0.1" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Currency Symbol</label>
                        <input type="text" defaultValue="$" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Timezone</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none">
                            <option className="bg-slate-900">UTC (Default)</option>
                            <option className="bg-slate-900">Asia/Kolkata (IST)</option>
                            <option className="bg-slate-900">America/New_York</option>
                            <option className="bg-slate-900">Asia/Tokyo</option>
                            <option className="bg-slate-900">Europe/London</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-800 pb-4 mb-4 text-white">
                        <Settings className="w-4 h-4 text-amber-400" /> Notifications & Alerts
                    </h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500 bg-slate-700" />
                            <div>
                                <p className="font-semibold text-white">Critical System Alerts</p>
                                <p className="text-xs text-slate-400">Receive SMS for system downtime or high failure rates.</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500 bg-slate-700" />
                            <div>
                                <p className="font-semibold text-white">Daily Summary Report</p>
                                <p className="text-xs text-slate-400">Receive a summary of sales and performance every night.</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:border-amber-500/50 transition-colors">
                            <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500 bg-slate-700" />
                            <div>
                                <p className="font-semibold text-white">Event Pass Booking Alerts</p>
                                <p className="text-xs text-slate-400">Notify when a guest books passes for any event.</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="pt-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-800 pb-4 mb-4 text-white">
                        <Settings className="w-4 h-4 text-amber-400" /> Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">Session Timeout (minutes)</label>
                            <input type="number" defaultValue="120" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">Require 2FA for Managers</label>
                            <select className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:border-amber-500 outline-none">
                                <option className="bg-slate-900">Enabled</option>
                                <option className="bg-slate-900">Disabled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={() => { setGeneralSaved(true); toast.success('General settings saved!'); setTimeout(() => setGeneralSaved(false), 2000); }}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                    >
                        <Save className="w-5 h-5" /> {generalSaved ? 'Saved ✓' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* ── Payment Gateway Settings ── */}
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Payment Gateway Settings</h2>
                            <p className="text-xs text-slate-400">Configure how customers pay for event passes. Shown on booking pages.</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
                        LIVE ON EVENT BOOKINGS
                    </span>
                </div>

                {/* UPI / Bank Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">UPI & Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">UPI ID / Payment Handle</label>
                            <input
                                type="text"
                                value={paymentSettings.upiId}
                                onChange={e => updatePayment('upiId', e.target.value)}
                                placeholder="e.g. restaurant@upi or 9876543210@paytm"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-mono focus:border-amber-500 outline-none placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Bank Name</label>
                            <input
                                type="text"
                                value={paymentSettings.bankName}
                                onChange={e => updatePayment('bankName', e.target.value)}
                                placeholder="e.g. HDFC Bank"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Account Holder Name</label>
                            <input
                                type="text"
                                value={paymentSettings.accountName}
                                onChange={e => updatePayment('accountName', e.target.value)}
                                placeholder="e.g. Heaven4 Enterprises Pvt Ltd"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm focus:border-amber-500 outline-none placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">Account Number</label>
                            <div className="relative">
                                <input
                                    type={showAccountNumber ? 'text' : 'password'}
                                    value={paymentSettings.accountNumber}
                                    onChange={e => updatePayment('accountNumber', e.target.value)}
                                    placeholder="Bank account number"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 pr-12 text-white text-sm font-mono focus:border-amber-500 outline-none placeholder:text-slate-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5">IFSC Code</label>
                            <input
                                type="text"
                                value={paymentSettings.ifscCode}
                                onChange={e => updatePayment('ifscCode', e.target.value.toUpperCase())}
                                placeholder="e.g. HDFC0001234"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-mono focus:border-amber-500 outline-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment QR Code */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Payment QR Code</h3>
                    <p className="text-xs text-slate-500">This QR code is displayed to customers during event pass checkout so they can scan and pay directly.</p>

                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setQrInputMode('url')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${qrInputMode === 'url' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                        >
                            <Link2 className="w-3.5 h-3.5" /> Paste URL
                        </button>
                        <button
                            onClick={() => setQrInputMode('upload')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${qrInputMode === 'upload' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                        >
                            <Upload className="w-3.5 h-3.5" /> Upload Image
                        </button>
                    </div>

                    {qrInputMode === 'url' ? (
                        <input
                            type="url"
                            value={paymentSettings.paymentQrUrl}
                            onChange={e => updatePayment('paymentQrUrl', e.target.value)}
                            placeholder="https://your-upi-qr-image-url.com/qr.png"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm font-mono focus:border-amber-500 outline-none placeholder:text-slate-600"
                        />
                    ) : (
                        <label className="flex flex-col items-center justify-center p-6 bg-slate-800 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-amber-500/50 transition-colors">
                            <Upload className="w-8 h-8 text-slate-500 mb-2" />
                            <span className="text-sm font-semibold text-slate-400">Click to upload QR image</span>
                            <span className="text-xs text-slate-600 mt-1">PNG, JPG, WebP up to 5MB</span>
                            <input type="file" accept="image/*" onChange={handleQrFileUpload} className="hidden" />
                        </label>
                    )}

                    {/* QR Preview */}
                    {paymentSettings.paymentQrUrl && (
                        <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-2xl border border-slate-700">
                            <img
                                src={paymentSettings.paymentQrUrl}
                                alt="Payment QR Preview"
                                className="w-24 h-24 rounded-xl object-contain bg-white p-2"
                                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/96?text=QR'; }}
                            />
                            <div>
                                <p className="text-sm font-bold text-emerald-400">✓ QR Code Preview</p>
                                <p className="text-xs text-slate-400 mt-1">This is what customers will see on the checkout page</p>
                                {paymentSettings.upiId && (
                                    <p className="text-xs font-mono text-amber-400 mt-1">UPI: {paymentSettings.upiId}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Note */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">Payment Instructions (shown to customer)</label>
                    <textarea
                        value={paymentSettings.paymentNote}
                        onChange={e => updatePayment('paymentNote', e.target.value)}
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm resize-none focus:border-amber-500 outline-none"
                    />
                </div>

                {/* Placeholder notice */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <p className="text-xs font-bold text-amber-300">⚠️ Payment Gateway Integration</p>
                    <p className="text-xs text-amber-200/70 mt-1">
                        Real payment processing (Razorpay, Stripe, PayU) will be activated in a future phase. 
                        Currently, customers see the payment details and confirm payment manually. 
                        Transaction verification is manual by the event manager.
                    </p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSavePayment}
                        disabled={paymentSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                    >
                        {paymentSaving ? (
                            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><QrCode className="w-5 h-5" /> Save Payment Settings</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
