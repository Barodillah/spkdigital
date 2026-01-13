import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Phone, User, Bell, Truck, UserCheck, Users, PenLine, Trash2, AlertTriangle, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useSPK } from '../contexts/SPKContext';

// Delete Confirmation Modal Component
function DeleteConfirmModal({ spk, isOpen, onClose, onConfirm, isDeleting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-800">Hapus Data SPK?</h3>
                            <p className="text-sm text-red-600">Aksi ini tidak dapat dibatalkan</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-auto w-8 h-8 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-red-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                    <p className="text-slate-600 mb-3">
                        Anda akan menghapus data SPK berikut:
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                            SPK #{spk.spkNo}
                        </p>
                        <p className="text-base font-bold text-slate-800">{spk.custName}</p>
                        <p className="text-sm text-slate-500 mt-1">{spk.unitType} - {spk.color}</p>
                    </div>
                    <p className="text-sm text-slate-500 mt-3">
                        Semua data termasuk foto, janji sales, dan tanda tangan akan dihapus secara permanen.
                    </p>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Ya, Hapus
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SPKCard({ spk, showStatus = true, onClick }) {
    const navigate = useNavigate();
    const { deleteSPK } = useSPK();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteSPK(spk.id);
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting SPK:', error);
            alert('Gagal menghapus data SPK. Silakan coba lagi.');
        } finally {
            setIsDeleting(false);
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
        <>
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
                    <div className="flex items-center gap-1">
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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteModal(true);
                            }}
                            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                            title="Hapus SPK"
                        >
                            <Trash2 size={14} />
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                spk={spk}
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
            />
        </>
    );
}

