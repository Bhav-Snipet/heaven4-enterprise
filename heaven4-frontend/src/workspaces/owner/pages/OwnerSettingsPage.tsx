import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OwnerSettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gold-400">Global Settings</h1>
                <p className="text-slate-400 mt-1">Configure restaurant-wide preferences</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-800 pb-4">
                    <Settings className="w-5 h-5 text-gold-400" /> General Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Restaurant Name</label>
                        <input type="text" defaultValue="Heaven4 Enterprise" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-gold-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Tax Rate (%)</label>
                        <input type="number" defaultValue="8.0" step="0.1" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-gold-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Currency Symbol</label>
                        <input type="text" defaultValue="$" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-gold-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-400 mb-2">Timezone</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-gold-500 outline-none">
                            <option>UTC (Default)</option>
                            <option>America/New_York</option>
                            <option>Asia/Tokyo</option>
                        </select>
                    </div>
                </div>

                <div className="pt-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
                        <Settings className="w-5 h-5 text-gold-400" /> Notifications & Alerts
                    </h2>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:border-gold-500/50 transition-colors">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-600 text-gold-500 focus:ring-gold-500 focus:ring-offset-slate-900 bg-slate-700" />
                            <div>
                                <p className="font-semibold text-white">Critical System Alerts</p>
                                <p className="text-xs text-slate-400">Receive SMS for system downtime or high failure rates.</p>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 cursor-pointer hover:border-gold-500/50 transition-colors">
                            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-600 text-gold-500 focus:ring-gold-500 focus:ring-offset-slate-900 bg-slate-700" />
                            <div>
                                <p className="font-semibold text-white">Daily Summary Report</p>
                                <p className="text-xs text-slate-400">Receive an email summary of sales and performance every night.</p>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="pt-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
                        <Settings className="w-5 h-5 text-gold-400" /> Security
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">Session Timeout (minutes)</label>
                            <input type="number" defaultValue="120" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-gold-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-400 mb-2">Require 2FA for Managers</label>
                            <select className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 focus:border-gold-500 outline-none">
                                <option>Enabled</option>
                                <option>Disabled</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={() => toast.success('Settings saved successfully!')}
                        className="flex items-center gap-2 px-6 py-3 bg-gold-600 hover:bg-gold-500 text-black font-bold rounded-xl transition-colors shadow-lg shadow-gold-500/20"
                    >
                        <Save className="w-5 h-5" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
