import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SPKCard({ spk, showStatus = true, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(spk);
        } else {
            navigate(`/manager/validate/${spk.id}`);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        SPK #{spk.spkNo}
                    </p>
                    <h3 className="text-base font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        {spk.custName}
                    </h3>
                </div>
                <ChevronRight
                    size={20}
                    className="text-slate-300 group-hover:text-slate-500 transition-colors"
                />
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                <p className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{spk.unitType}</span>
                    <span className="text-slate-300">•</span>
                    <span>{spk.color}</span>
                </p>
                <p className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="truncate">{spk.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400" />
                    <span>Dibuat: {formatDate(spk.createdAt)}</span>
                </p>
            </div>

            {showStatus && (
                <div className="pt-2 border-t border-slate-100">
                    <StatusBadge status={spk.status} size="sm" />
                </div>
            )}
        </div>
    );
}
