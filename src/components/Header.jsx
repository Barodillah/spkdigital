import React from 'react';
import { ShieldCheck, LayoutDashboard, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({
    title,
    subtitle,
    status,
    showBack = false,
    backTo = '/',
    isManager = false
}) {
    const navigate = useNavigate();

    return (
        <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
            <div className="max-w-2xl mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {showBack && (
                            <button
                                onClick={() => navigate(backTo)}
                                className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-500" />
                            </button>
                        )}
                        <div className="flex items-center gap-2">
                            {isManager ? (
                                <LayoutDashboard size={22} className="text-slate-700" />
                            ) : (
                                <ShieldCheck size={22} className="text-red-600" />
                            )}
                            <div>
                                <h1 className={`font-black tracking-tight ${isManager ? 'text-slate-800' : 'text-red-600 italic'}`}>
                                    {title || (isManager ? 'CS MANAGER' : 'DIGITAL SPK')}
                                </h1>
                                {subtitle && (
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest -mt-0.5">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
                            <div className={`w-2 h-2 rounded-full ${status === 'done' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                                }`} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                {status}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
