import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Phone, User, Bell, Truck, UserCheck, Users, PenLine } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SPKCard({ spk, showStatus = true, onClick }) {
    const navigate = useNavigate();

    const getNavigationPath = () => {
        switch (spk.status) {
            case 'BUTUH_KONFIRMASI_KESIAPAN':
                return `/manager/konfirmasi-kesiapan/${spk.id}`;
            case 'SIAP_KIRIM':
                return `/manager/pdi-matching/${spk.id}`;
            case 'PDI_MATCHED':
                return `/manager/surat-jalan/${spk.id}`;
            default:
                return `/manager/validate/${spk.id}`;
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick(spk);
        } else {
            navigate(getNavigationPath());
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getDaysUntilDelivery = () => {
        if (!spk.estimatedDeliveryDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deliveryDate = new Date(spk.estimatedDeliveryDate);
        deliveryDate.setHours(0, 0, 0, 0);
        const diffTime = deliveryDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = getDaysUntilDelivery();
    const isH5Alert = spk.status === 'BUTUH_KONFIRMASI_KESIAPAN';
    const isSiapKirim = spk.status === 'SIAP_KIRIM';
    const isPdiMatched = spk.status === 'PDI_MATCHED';

    return (
        <div
            onClick={handleClick}
            className={`bg-white rounded-2xl border p-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group ${isH5Alert ? 'border-orange-300 bg-orange-50/30' :
                isSiapKirim ? 'border-blue-300 bg-blue-50/30' :
                    isPdiMatched ? 'border-emerald-300 bg-emerald-50/30' :
                        'border-slate-200'
                }`}
        >
            {/* Sales & SPV Header */}
            {(spk.salesName || spk.spvName) && (
                <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-100">
                    {spk.salesName && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <UserCheck size={12} className="text-blue-500" />
                            <span className="text-slate-400 font-medium">Sales:</span>
                            <span className="text-slate-700 font-bold">{spk.salesName}</span>
                        </div>
                    )}
                    {spk.salesName && spk.spvName && (
                        <span className="text-slate-200">|</span>
                    )}
                    {spk.spvName && (
                        <div className="flex items-center gap-1.5 text-xs">
                            <Users size={12} className="text-purple-500" />
                            <span className="text-slate-400 font-medium">SPV:</span>
                            <span className="text-slate-700 font-bold">{spk.spvName}</span>
                        </div>
                    )}
                </div>
            )}

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
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/manager/edit/${spk.id}`);
                        }}
                        className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit SPK"
                    >
                        <PenLine size={14} />
                    </button>
                    <ChevronRight
                        size={20}
                        className="text-slate-300 group-hover:text-slate-500 transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                <p className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{spk.unitType}</span>
                    <span className="text-slate-300">•</span>
                    <span>{spk.color}</span>
                </p>
                <p className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" />
                    <span>{spk.waNo}</span>
                </p>
                <p className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400" />
                    <span>Kirim: {spk.estimatedDeliveryDate ? formatDate(spk.estimatedDeliveryDate) : '-'}</span>
                    {daysLeft !== null && daysLeft <= 5 && daysLeft >= 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                            H-{daysLeft}
                        </span>
                    )}
                </p>
            </div>

            {showStatus && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <StatusBadge status={spk.status} size="sm" />
                    {isH5Alert && (
                        <div className="flex items-center gap-1 text-orange-600">
                            <Bell size={12} />
                            <span className="text-[10px] font-bold">Konfirmasi!</span>
                        </div>
                    )}
                    {isSiapKirim && (
                        <div className="flex items-center gap-1 text-blue-600">
                            <Truck size={12} />
                            <span className="text-[10px] font-bold">Input PDI</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

