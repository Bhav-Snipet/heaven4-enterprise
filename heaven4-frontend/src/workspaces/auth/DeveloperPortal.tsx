import { motion } from 'framer-motion';
import { Code, Settings2, Users, ChefHat, Briefcase, Shield, Hexagon } from 'lucide-react';

const ROLE_CARDS = [
    { name: 'Customer', desc: 'Browse menu, place orders, view bill', color: 'from-blue-500 to-blue-700', icon: Users, phone: '7020875435' },
    { name: 'Employee', desc: 'Manage tables, walk-in orders', color: 'from-emerald-500 to-emerald-700', icon: Briefcase, phone: '3333333333' },
    { name: 'Kitchen', desc: 'Live order display, status updates', color: 'from-orange-500 to-red-600', icon: ChefHat, phone: '2222222222' },
    { name: 'Manager', desc: 'Operations control, complaints', color: 'from-purple-500 to-purple-700', icon: Shield, phone: '1234567890' },
    { name: 'Admin', desc: 'Menu catalog, user management', color: 'from-rose-500 to-rose-700', icon: Shield, phone: '70208785435' },
    { name: 'Owner', desc: 'Revenue dashboard, reports', color: 'from-amber-400 to-amber-600', icon: Hexagon, phone: '1111111111' },
];

export default function DeveloperPortal() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030712] relative overflow-hidden p-6">
            {/* Background glow */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-heaven-900/30 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
            </div>
            
            <div className="relative z-10 w-full max-w-3xl text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md mb-6"
                >
                    <Code className="w-8 h-8 text-heaven-400" />
                </motion.div>

                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-bold text-white tracking-tight"
                >
                    Developer <span className="text-heaven-400">Portal</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 mt-3 text-base max-w-md mx-auto"
                >
                    You are logged in as <strong className="text-white">Developer</strong>. 
                    Use the <Settings2 className="inline w-4 h-4 mx-1 text-heaven-400" /> 
                    <span className="text-heaven-400">Role Switcher</span> in the bottom-right corner to jump into any workspace.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left"
                >
                    {ROLE_CARDS.map((r, i) => (
                        <motion.div
                            key={r.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.07 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-3 shadow-lg`}>
                                <r.icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-white text-lg">{r.name}</h3>
                            <p className="text-sm text-slate-400 mt-1">{r.desc}</p>
                            <p className="text-xs text-slate-600 mt-2 font-mono">{r.phone}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-xs text-slate-600"
                >
                    All accounts use OTP: <strong className="text-slate-400">1234</strong>
                </motion.p>
            </div>
        </div>
    );
}
