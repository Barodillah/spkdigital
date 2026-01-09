import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    Users,
    TrendingUp
} from 'lucide-react';
import Header from '../components/Header';
import SPKCard from '../components/SPKCard';
import { useSPK } from '../contexts/SPKContext';

const STATUS_FILTERS = [
    { value: 'ALL', label: 'Semua', icon: FileText },
    { value: 'PENDING_VALIDATION', label: 'Pending', icon: Clock },
    { value: 'VALID', label: 'Valid', icon: CheckCircle },
    { value: 'REVISE', label: 'Revisi', icon: AlertCircle },
];

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const { spkRecords, getStats, loading } = useSPK();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const stats = getStats();

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
                {/* Stats Cards */}
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

                    <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <CheckCircle size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Valid</span>
                        </div>
                        <p className="text-2xl font-black text-green-700">{stats.valid}</p>
                    </div>

                    <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                        <div className="flex items-center gap-2 text-red-600 mb-1">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Revisi</span>
                        </div>
                        <p className="text-2xl font-black text-red-700">{stats.revise}</p>
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
                            const count = filter.value === 'ALL'
                                ? stats.total
                                : stats[filter.value.toLowerCase().replace('_validation', '')] || 0;

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

                {/* Quick Link */}
                <div className="text-center pt-4">
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
