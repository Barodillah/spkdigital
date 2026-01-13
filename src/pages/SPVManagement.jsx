import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Plus,
    Edit3,
    Trash2,
    Save,
    X,
    UserCheck,
    Search,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import Header from '../components/Header';

// API base URL - uses environment variable or fallback based on mode
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api');

export default function SPVManagement() {
    const navigate = useNavigate();
    const [spvList, setSpvList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [notif, setNotif] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        active: true
    });

    // Load data from API on mount
    useEffect(() => {
        fetchSPVList();
    }, []);

    const fetchSPVList = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/spv`);
            if (!response.ok) throw new Error('Failed to fetch SPV list');
            const data = await response.json();
            setSpvList(data);
        } catch (error) {
            console.error('Error loading SPV list:', error);
            notify('Gagal memuat data SPV', 'error');
        } finally {
            setLoading(false);
        }
    };

    const notify = (msg, type = 'success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', active: true });
        setIsAdding(false);
        setEditingId(null);
    };


    const handleAdd = async () => {
        if (!formData.name.trim()) {
            notify('Nama SPV wajib diisi', 'error');
            return;
        }

        // Check duplicate name
        const isDuplicate = spvList.some(
            spv => spv.name.toLowerCase() === formData.name.toLowerCase()
        );
        if (isDuplicate) {
            notify('Nama SPV sudah ada', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/spv`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    active: formData.active
                })
            });
            if (!response.ok) throw new Error('Failed to add SPV');

            await fetchSPVList(); // Refresh list
            notify('SPV berhasil ditambahkan');
            resetForm();
        } catch (error) {
            console.error('Error adding SPV:', error);
            notify('Gagal menambahkan SPV', 'error');
        }
    };

    const handleEdit = (spv) => {
        setEditingId(spv.id);
        setFormData({
            name: spv.name,
            phone: spv.phone || '',
            active: spv.active
        });
        setIsAdding(false);
    };

    const handleUpdate = async () => {
        if (!formData.name.trim()) {
            notify('Nama SPV wajib diisi', 'error');
            return;
        }

        // Check duplicate name (except current editing)
        const isDuplicate = spvList.some(
            spv => spv.name.toLowerCase() === formData.name.toLowerCase() && spv.id !== editingId
        );
        if (isDuplicate) {
            notify('Nama SPV sudah ada', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/spv/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    active: formData.active
                })
            });
            if (!response.ok) throw new Error('Failed to update SPV');

            await fetchSPVList(); // Refresh list
            notify('SPV berhasil diupdate');
            resetForm();
        } catch (error) {
            console.error('Error updating SPV:', error);
            notify('Gagal mengupdate SPV', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus SPV ini?')) {
            try {
                const response = await fetch(`${API_BASE}/spv/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Failed to delete SPV');

                await fetchSPVList(); // Refresh list
                notify('SPV berhasil dihapus');
            } catch (error) {
                console.error('Error deleting SPV:', error);
                notify('Gagal menghapus SPV', 'error');
            }
        }
    };

    const handleToggleActive = async (id) => {
        const spv = spvList.find(s => s.id === id);
        if (!spv) return;

        try {
            const response = await fetch(`${API_BASE}/spv/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: spv.name,
                    phone: spv.phone,
                    active: !spv.active
                })
            });
            if (!response.ok) throw new Error('Failed to toggle SPV status');

            await fetchSPVList(); // Refresh list
        } catch (error) {
            console.error('Error toggling SPV status:', error);
            notify('Gagal mengubah status SPV', 'error');
        }
    };

    const filteredList = spvList.filter(spv => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            spv.name.toLowerCase().includes(query) ||
            (spv.phone && spv.phone.includes(query))
        );
    });

    const stats = {
        total: spvList.length,
        active: spvList.filter(s => s.active).length,
        inactive: spvList.filter(s => !s.active).length
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Notification */}
            {notif && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in max-w-[90%] ${notif.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                    }`}>
                    <span className="font-medium text-sm">{notif.msg}</span>
                </div>
            )}

            <Header
                isManager
                title="MANAGER"
                subtitle="Manajemen Data SPV"
            />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                        <span className="ml-3 text-slate-500">Memuat data...</span>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Users size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Total SPV</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                            </div>

                            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                    <UserCheck size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Aktif</span>
                                </div>
                                <p className="text-2xl font-black text-emerald-700">{stats.active}</p>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Users size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Nonaktif</span>
                                </div>
                                <p className="text-2xl font-black text-slate-500">{stats.inactive}</p>
                            </div>
                        </div>

                        {/* Add/Edit Form */}
                        {(isAdding || editingId) && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-slide-up">
                                <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                                    {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
                                    {editingId ? 'Edit SPV' : 'Tambah SPV Baru'}
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                                NAMA SPV <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Masukkan nama SPV"
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                                NO. TELEPON
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="08xxxxxxxxxx"
                                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                            STATUS
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: true, label: 'Aktif', color: 'emerald' },
                                                { value: false, label: 'Nonaktif', color: 'slate' }
                                            ].map(option => (
                                                <button
                                                    key={option.label}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, active: option.value }))}
                                                    className={`p-3 rounded-xl border font-bold text-sm transition-all ${formData.active === option.value
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={editingId ? handleUpdate : handleAdd}
                                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                                        >
                                            <Save size={16} />
                                            {editingId ? 'Simpan Perubahan' : 'Tambah SPV'}
                                        </button>
                                        <button
                                            onClick={resetForm}
                                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                                        >
                                            <X size={16} />
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search & Add Button */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau nomor telepon SPV..."
                                        className="w-full p-3 pl-11 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {!isAdding && !editingId && (
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus size={18} />
                                        Tambah
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* SPV List */}
                        <div className="space-y-3">
                            {filteredList.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                                    <Users size={40} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">
                                        {searchQuery ? 'Tidak ada SPV yang cocok dengan pencarian' : 'Belum ada data SPV'}
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            onClick={() => setIsAdding(true)}
                                            className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                                        >
                                            Tambah SPV Pertama →
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredList.map(spv => (
                                        <div
                                            key={spv.id}
                                            className={`bg-white rounded-2xl p-4 border shadow-sm transition-all ${spv.active
                                                ? 'border-slate-200 hover:border-blue-200'
                                                : 'border-slate-200 bg-slate-50 opacity-60'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                {/* Avatar */}
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${spv.active
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {spv.name.charAt(0).toUpperCase()}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                        {spv.name}
                                                        {spv.active && (
                                                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                                                                AKTIF
                                                            </span>
                                                        )}
                                                        {!spv.active && (
                                                            <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full font-bold">
                                                                NONAKTIF
                                                            </span>
                                                        )}
                                                    </h3>
                                                    {spv.phone && (
                                                        <p className="text-sm text-slate-500">{spv.phone}</p>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggleActive(spv.id)}
                                                        className={`p-2 rounded-lg transition-colors ${spv.active
                                                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                            }`}
                                                        title={spv.active ? 'Nonaktifkan' : 'Aktifkan'}
                                                    >
                                                        <UserCheck size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(spv)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(spv.id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Back Button */}
                        <div className="text-center pt-4">
                            <button
                                onClick={() => navigate('/manager')}
                                className="text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <ArrowLeft size={16} />
                                Kembali ke Dashboard
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
