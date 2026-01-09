import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function PromiseList({
    promises,
    onAdd,
    onRemove,
    newPromise,
    onNewPromiseChange,
    readOnly = false,
    showConfirmation = false,
    onConfirm
}) {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && newPromise?.trim()) {
            onAdd();
        }
    };

    return (
        <div className="space-y-3">
            {!readOnly && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Contoh: Kaca film 40%, Karpet dasar..."
                        className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm transition-all"
                        value={newPromise}
                        onChange={(e) => onNewPromiseChange(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        type="button"
                        onClick={onAdd}
                        disabled={!newPromise?.trim()}
                        className="bg-slate-800 text-white p-4 rounded-2xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {promises.length === 0 ? (
                    <div className="text-center p-4 bg-slate-50 rounded-2xl border border-dashed text-xs text-slate-400 font-medium italic">
                        {readOnly ? 'Tidak ada janji tambahan yang dicatat' : 'Belum ada janji ditambahkan'}
                    </div>
                ) : (
                    promises.map((p, idx) => (
                        <div
                            key={p.id || idx}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${showConfirmation
                                    ? 'bg-white border-slate-200 shadow-sm'
                                    : 'bg-slate-50 border-slate-100'
                                }`}
                        >
                            {showConfirmation && (
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={p.confirmed}
                                        onChange={(e) => onConfirm(p.id, e.target.checked)}
                                        className="w-5 h-5 rounded-md border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                    />
                                </label>
                            )}
                            <span className={`flex-1 text-sm font-semibold italic ${showConfirmation && !p.confirmed ? 'text-slate-400' : 'text-slate-700'
                                }`}>
                                "{p.promiseText || p.text}"
                            </span>
                            {!readOnly && onRemove && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(idx)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
