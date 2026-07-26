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
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <QrCode className="w-8 h-8 text-blue-500" />
                        Table QR Management
                    </h1>
                    <p className="text-slate-500 mt-1">Generate scannable QR codes for customers to identify their tables.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold mb-4">Add New Table</h3>
                        <form onSubmit={handleAddTable} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Table Identifier</label>
                                <input 
                                    type="text" 
                                    value={newTableNumber}
                                    onChange={e => setNewTableNumber(e.target.value)}
                                    placeholder="e.g. 10 or VIP-3"
                                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</label>
                                <input 
                                    type="number" 
                                    value={newCapacity}
                                    onChange={e => setNewCapacity(Number(e.target.value))}
                                    min={1}
                                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <button type="submit" disabled={!newTableNumber.trim()} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                                <Plus className="w-5 h-5" /> Add Table
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {tables.map(table => (
                            <div key={table.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center relative group">
                                <button onClick={() => handleDelete(table.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                
                                <h4 className="text-xl font-bold mb-1">Table {table.number}</h4>
                                <p className="text-sm text-slate-500 mb-6">{table.capacity} Seats</p>
                                
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl mb-6 inline-block">
                                    <QRCodeSVG 
                                        id={`qr-${table.number}`}
                                        value={`${window.location.origin}/customer/menu?table=${table.number}`} 
                                        size={150} 
                                        level="H" 
                                        includeMargin={true}
                                    />
                                </div>
                                
                                <button onClick={() => printQR(table.number)} className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all">
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
