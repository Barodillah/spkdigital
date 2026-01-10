import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Users,
    TrendingUp,
    Bell,
    Truck,
    Package,
    Settings
} from 'lucide-react';
import Header from '../components/Header';
import SPKCard from '../components/SPKCard';
import { useSPK } from '../contexts/SPKContext';

const STATUS_FILTERS = [
    { value: 'ALL', label: 'Semua', icon: FileText },
    { value: 'PENDING_VALIDATION', label: 'Pending', icon: Clock },
    { value: 'VALID', label: 'Valid', icon: CheckCircle },
    { value: 'BUTUH_KONFIRMASI_KESIAPAN', label: 'H-5 Alert', icon: Bell },
    { value: 'SIAP_KIRIM', label: 'Siap Kirim', icon: Truck },
    { value: 'PDI_MATCHED', label: 'PDI OK', icon: Package },
    { value: 'REVISE', label: 'Revisi', icon: AlertCircle },
];

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const { spkRecords, getStats, loading, getAlertRecords } = useSPK();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const stats = getStats();
    const alertRecords = getAlertRecords();

    const filteredRecords = useMemo(() => {
        let records = [...spkRecords];

        // Filter by status
        if (statusFilter !== 'ALL') {
            records = records.filter(r => r.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            records = records.filter(r =>
                r.custName.toLowerCase().includes(query) ||
                r.spkNo.toLowerCase().includes(query) ||
                r.waNo.includes(query)
            );
        }

        // Sort by date (newest first)
        records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return records;
    }, [spkRecords, statusFilter, searchQuery]);

    const getStatusCount = (statusValue) => {
        if (statusValue === 'ALL') return stats.total;
        const statusMap = {
            'PENDING_VALIDATION': stats.pending,
            'VALID': stats.valid,
            'REVISE': stats.revise,
            'BUTUH_KONFIRMASI_KESIAPAN': stats.butuhKonfirmasi,
            'SIAP_KIRIM': stats.siapKirim,
            'PDI_MATCHED': stats.pdiMatched,
        };
        return statusMap[statusValue] || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <Header
                isManager
                title="CS MANAGER"
                subtitle="Dashboard Validasi SPK"
            />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* H-5 Alert Banner */}
                {alertRecords.length > 0 && (
                    <div className="bg-orange-100 border-2 border-orange-300 rounded-2xl p-4 animate-pulse-slow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bell size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-orange-800">
                                    {alertRecords.length} SPK Butuh Konfirmasi Kesiapan!
                                </h3>
                                <p className="text-xs text-orange-700">
                                    H-5 atau kurang sebelum tanggal pengiriman
                                </p>
                            </div>
                            <button
                                onClick={() => setStatusFilter('BUTUH_KONFIRMASI_KESIAPAN')}
                                className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-xs hover:bg-orange-600 transition-colors"
                            >
                                Lihat
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards - Updated */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <FileText size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Total SPK</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
                        </div>
                        <p className="text-2xl font-black text-amber-700">{stats.pending}</p>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                        <div className="flex items-center gap-2 text-orange-600 mb-1">
                            <Bell size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">H-5 Alert</span>
                        </div>
                        <p className="text-2xl font-black text-orange-700">{stats.butuhKonfirmasi || 0}</p>
                    </div>

                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                            <Package size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">PDI OK</span>
                        </div>
                        <p className="text-2xl font-black text-emerald-700">{stats.pdiMatched || 0}</p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari nama konsumen, No. SPK, atau No. WA..."
                            className="w-full p-3 pl-11 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Status Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {STATUS_FILTERS.map(filter => {
                            const Icon = filter.icon;
                            const isActive = statusFilter === filter.value;
                            const count = getStatusCount(filter.value);

                            return (
                                <button
                                    key={filter.value}
                                    onClick={() => setStatusFilter(filter.value)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${isActive
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {filter.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200'
                                        }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* SPK List */}
                <div className="space-y-3">
                    {filteredRecords.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                            <Users size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">
                                {searchQuery || statusFilter !== 'ALL'
                                    ? 'Tidak ada SPK yang cocok dengan filter'
                                    : 'Belum ada data SPK'}
                            </p>
                            {spkRecords.length === 0 && (
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                                >
                                    Input SPK Pertama →
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                            {filteredRecords.map(spk => (
                                <SPKCard key={spk.id} spk={spk} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => navigate('/manager/spv')}
                        className="text-sm text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                        <Settings size={14} />
                        Kelola Data SPV
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    >
                        ← Kembali ke Form Sales
                    </button>
                </div>
            </main>
        </div>
    );
}

