import { useState } from 'react';
import { Plus, Trash2, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Table {
    id: number;
    number: string;
    capacity: number;
}

export default function AdminTablesPage() {
    const [tables, setTables] = useState<Table[]>([
        { id: 1, number: '1', capacity: 2 },
        { id: 2, number: '2', capacity: 4 },
        { id: 3, number: 'VIP-1', capacity: 6 }
    ]);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [newCapacity, setNewCapacity] = useState(4);
    
    const handleAddTable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTableNumber.trim()) return;
        
        const newTable: Table = {
            id: Date.now(),
            number: newTableNumber,
            capacity: newCapacity
        };
        setTables([...tables, newTable]);
        setNewTableNumber('');
    };

    const handleDelete = (id: number) => {
        setTables(tables.filter(t => t.id !== id));
    };

    const printQR = (tableNumber: string) => {
        const svgElement = document.getElementById(`qr-${tableNumber}`);
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`
                <html>
                <head>
                    <title>Table ${tableNumber} QR Code</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                        h1 { font-size: 3rem; margin-bottom: 2rem; }
                    </style>
                </head>
                <body>
                    <h1>Table ${tableNumber}</h1>
                    ${svgData}
                    <script>window.print(); window.close();</script>
                </body>
                </html>
            `);
            win.document.close();
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent flex items-center gap-3">
                        <QrCode className="w-8 h-8 text-blue-400" />
                        Table QR Code & Floor Layout Management
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Generate scannable QR codes for customers to view the digital menu and place table orders.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                        <h3 className="font-bold text-lg text-white">Add New Dining Table</h3>
                        <form onSubmit={handleAddTable} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Table Identifier</label>
                                <input 
                                    type="text" 
                                    value={newTableNumber}
                                    onChange={e => setNewTableNumber(e.target.value)}
                                    placeholder="e.g. 10 or VIP-3"
                                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity (Seats)</label>
                                <input 
                                    type="number" 
                                    value={newCapacity}
                                    onChange={e => setNewCapacity(Number(e.target.value))}
                                    min={1}
                                    className="w-full mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <button type="submit" disabled={!newTableNumber.trim()} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 text-xs disabled:opacity-50">
                                <Plus className="w-4 h-4" /> Register Table
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {tables.map(table => (
                            <div key={table.id} className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center relative group">
                                <button onClick={() => handleDelete(table.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-400 hover:bg-slate-950 rounded-xl transition-colors opacity-0 group-hover:opacity-100 border border-slate-800">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                
                                <h4 className="text-2xl font-black text-amber-400 mb-1">Table {table.number}</h4>
                                <p className="text-xs text-slate-400 font-semibold mb-4">{table.capacity} Guest Capacity</p>
                                
                                <div className="bg-white p-4 rounded-2xl mb-5 border-2 border-slate-800 shadow-inner">
                                    <QRCodeSVG 
                                        id={`qr-${table.number}`}
                                        value={`${window.location.origin}/customer/menu?table=${table.number}`} 
                                        size={140} 
                                        level="H" 
                                        includeMargin={true}
                                    />
                                </div>
                                
                                <button onClick={() => printQR(table.number)} className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-blue-400 hover:text-blue-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-800">
                                    <Printer className="w-4 h-4" /> Print QR Code
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
