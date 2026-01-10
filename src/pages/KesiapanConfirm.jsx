import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCircle,
    Calendar,
    Clock,
    User,
    Package,
    Phone,
    Truck,
    ArrowRight,
    AlertTriangle,
    FileCheck,
    UserCheck,
    Users
} from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useSPK } from '../contexts/SPKContext';
import { getStnkLabel, getNopolLabel } from '../utils/validation';

export default function KesiapanConfirm() {
    const { spkId } = useParams();
    const navigate = useNavigate();
    const { getSPKById, getPromisesBySPKId, confirmKesiapan } = useSPK();

    const [spk, setSpk] = useState(null);
    const [promises, setPromises] = useState([]);
    const [notif, setNotif] = useState(null);
    const [checklist, setChecklist] = useState({
        kesiapanKendaraan: false,
        validasiFaktur: false,
        pilihanNopol: false,
        prosesSTNK: false,
        suratJalan: false,
        konfirmasiKonsumen: false,
    });
    const [promiseChecklist, setPromiseChecklist] = useState({});

    // Storage key for temporary checklist
    const getStorageKey = () => `spkdigital_kesiapan_${spkId}`;

    // Load saved checklist from localStorage
    const loadSavedChecklist = () => {
        try {
            const saved = localStorage.getItem(getStorageKey());
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading saved checklist:', e);
        }
        return null;
    };

    // Save checklist to localStorage
    const saveChecklistTemp = () => {
        try {
            const dataToSave = {
                checklist,
                promiseChecklist,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(getStorageKey(), JSON.stringify(dataToSave));
            notify('Checklist berhasil disimpan sementara');
        } catch (e) {
            console.error('Error saving checklist:', e);
            notify('Gagal menyimpan checklist', 'error');
        }
    };

    // Clear saved checklist from localStorage
    const clearSavedChecklist = () => {
        try {
            localStorage.removeItem(getStorageKey());
        } catch (e) {
            console.error('Error clearing saved checklist:', e);
        }
    };

    useEffect(() => {
        const data = getSPKById(spkId);
        if (!data) {
            navigate('/manager');
            return;
        }
        if (data.status !== 'BUTUH_KONFIRMASI_KESIAPAN') {
            navigate(`/manager/validate/${spkId}`);
            return;
        }
        setSpk(data);

        // Get promises for this SPK
        const spkPromises = getPromisesBySPKId(spkId);
        setPromises(spkPromises);

        // Try to load saved checklist first
        const savedData = loadSavedChecklist();
        if (savedData) {
            setChecklist(prev => ({ ...prev, ...savedData.checklist }));
            if (savedData.promiseChecklist) {
                setPromiseChecklist(savedData.promiseChecklist);
            } else {
                // Initialize promise checklist if not saved
                const initialPromiseCheck = {};
                spkPromises.forEach(p => {
                    initialPromiseCheck[p.id] = false;
                });
                setPromiseChecklist(initialPromiseCheck);
            }
        } else {
            // Initialize promise checklist
            const initialPromiseCheck = {};
            spkPromises.forEach(p => {
                initialPromiseCheck[p.id] = false;
            });
            setPromiseChecklist(initialPromiseCheck);
        }
    }, [spkId, getSPKById, getPromisesBySPKId, navigate]);

    const notify = (msg, type = 'success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const toggleChecklist = (key) => {
        setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const togglePromiseCheck = (promiseId) => {
        setPromiseChecklist(prev => ({ ...prev, [promiseId]: !prev[promiseId] }));
    };

    // Build required checklist items dynamically
    const getRequiredChecks = () => {
        const checks = ['kesiapanKendaraan', 'validasiFaktur', 'pilihanNopol', 'prosesSTNK'];
        if (spk?.givenSuratJalan) {
            checks.push('suratJalan');
        }
        checks.push('konfirmasiKonsumen');
        return checks;
    };

    const allChecked = () => {
        // Check main checklist items
        const requiredChecks = getRequiredChecks();
        const mainChecked = requiredChecks.every(key => checklist[key]);

        // Check all promises
        const promisesChecked = promises.length === 0 || Object.values(promiseChecklist).every(v => v);

        return mainChecked && promisesChecked;
    };

    // Count checked items for progress
    const getProgress = () => {
        const requiredChecks = getRequiredChecks();
        const mainCheckedCount = requiredChecks.filter(key => checklist[key]).length;
        const promisesCheckedCount = Object.values(promiseChecklist).filter(v => v).length;
        const total = requiredChecks.length + promises.length;
        const checked = mainCheckedCount + promisesCheckedCount;
        return { checked, total };
    };

    const handleConfirm = () => {
        if (!allChecked()) {
            notify('Harap centang semua checklist kesiapan', 'error');
            return;
        }
        confirmKesiapan(spkId, { ...checklist, promiseChecklist });
        clearSavedChecklist(); // Clear temp save after confirm
        notify('Kesiapan pengiriman dikonfirmasi!');
        setTimeout(() => navigate(`/manager/pdi-matching/${spkId}`), 1500);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getDaysUntilDelivery = () => {
        if (!spk?.estimatedDeliveryDate) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deliveryDate = new Date(spk.estimatedDeliveryDate);
        deliveryDate.setHours(0, 0, 0, 0);
        const diffTime = deliveryDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (!spk) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
            </div>
        );
    }

    const daysLeft = getDaysUntilDelivery();

    return (
        <div className="min-h-screen bg-slate-100 pb-8">
            {/* Notification */}
            {notif && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in max-w-[90%] ${notif.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                    <span className="font-medium text-sm">{notif.msg}</span>
                </div>
            )}

            <Header
                isManager
                showBack
                backTo="/manager"
                title="KONFIRMASI KESIAPAN"
                subtitle={`SPK #${spk.spkNo}`}
            />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Alert Banner */}
                <div className="bg-orange-100 border-2 border-orange-300 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-orange-800 mb-1">
                            H-{daysLeft !== null ? daysLeft : '?'} Pengiriman!
                        </h2>
                        <p className="text-sm text-orange-700">
                            Tanggal kirim: <strong>{formatDate(spk.estimatedDeliveryDate)}</strong> pukul <strong>{spk.estimatedDeliveryTime}</strong>
                        </p>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                    <StatusBadge status={spk.status} size="lg" />
                </div>

                {/* SPK Summary */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Package size={14} /> Detail SPK
                    </h2>
                    <div className="space-y-3">
                        {/* Sales & SPV Info */}
                        {(spk.salesName || spk.spvName) && (
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl mb-2">
                                {spk.salesName && (
                                    <div className="flex items-center gap-2">
                                        <UserCheck size={16} className="text-blue-500" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Sales</p>
                                            <p className="text-sm font-bold text-slate-700">{spk.salesName}</p>
                                        </div>
                                    </div>
                                )}
                                {spk.spvName && (
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-purple-500" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">SPV</p>
                                            <p className="text-sm font-bold text-slate-700">{spk.spvName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                            <User size={18} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Konsumen</p>
                                <p className="text-base font-bold text-slate-800">{spk.custName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone size={18} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp</p>
                                <p className="text-sm font-medium text-slate-700">{spk.waNo}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Truck size={18} className="text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Unit</p>
                                <p className="text-base font-bold text-slate-800">{spk.unitType}</p>
                                <p className="text-sm text-slate-500">{spk.color} • {spk.unitYear}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checklist Kesiapan */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileCheck size={14} /> Checklist Kesiapan
                    </h2>
                    <div className="space-y-3">
                        {[
                            { key: 'kesiapanKendaraan', label: 'Kesiapan kendaraan' },
                            { key: 'validasiFaktur', label: 'Validasi Faktur' },
                        ].map(item => (
                            <button
                                key={item.key}
                                onClick={() => toggleChecklist(item.key)}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checklist[item.key]
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${checklist[item.key]
                                    ? 'bg-green-500'
                                    : 'border-2 border-slate-300'
                                    }`}>
                                    {checklist[item.key] && <CheckCircle size={16} className="text-white" />}
                                </div>
                                <span className={`font-medium ${checklist[item.key] ? 'text-green-700' : 'text-slate-600'}`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}

                        {/* Pilihan Nopol - dengan detail */}
                        <button
                            onClick={() => toggleChecklist('pilihanNopol')}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checklist.pilihanNopol
                                ? 'bg-green-50 border-green-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${checklist.pilihanNopol
                                ? 'bg-green-500'
                                : 'border-2 border-slate-300'
                                }`}>
                                {checklist.pilihanNopol && <CheckCircle size={16} className="text-white" />}
                            </div>
                            <div className="flex-1">
                                <span className={`font-medium ${checklist.pilihanNopol ? 'text-green-700' : 'text-slate-600'}`}>
                                    Pilihan Nopol
                                </span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    🚗 {getNopolLabel(spk.nopolType, spk.nopolPilihan)}
                                </p>
                            </div>
                        </button>

                        {/* Proses STNK - dengan detail */}
                        <button
                            onClick={() => toggleChecklist('prosesSTNK')}
                            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checklist.prosesSTNK
                                ? 'bg-green-50 border-green-300'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${checklist.prosesSTNK
                                ? 'bg-green-500'
                                : 'border-2 border-slate-300'
                                }`}>
                                {checklist.prosesSTNK && <CheckCircle size={16} className="text-white" />}
                            </div>
                            <div className="flex-1">
                                <span className={`font-medium ${checklist.prosesSTNK ? 'text-green-700' : 'text-slate-600'}`}>
                                    Proses STNK
                                </span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    📄 {getStnkLabel(spk.stnkType, spk.stnkDays)}
                                </p>
                            </div>
                        </button>

                        {/* Surat Jalan - only show if givenSuratJalan is true */}
                        {spk.givenSuratJalan && (
                            <button
                                onClick={() => toggleChecklist('suratJalan')}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checklist.suratJalan
                                    ? 'bg-green-50 border-green-300'
                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${checklist.suratJalan
                                    ? 'bg-green-500'
                                    : 'border-2 border-slate-300'
                                    }`}>
                                    {checklist.suratJalan && <CheckCircle size={16} className="text-white" />}
                                </div>
                                <span className={`font-medium ${checklist.suratJalan ? 'text-green-700' : 'text-slate-600'}`}>
                                    Kesiapan Surat Jalan
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Checklist Janji Sales */}
                {promises.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            🎁 Konfirmasi Janji Sales
                        </h2>
                        <p className="text-xs text-slate-500 mb-3">
                            Pastikan setiap janji berikut sudah siap dipenuhi:
                        </p>
                        <div className="space-y-3">
                            {promises.map((promise, idx) => (
                                <button
                                    key={promise.id}
                                    onClick={() => togglePromiseCheck(promise.id)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${promiseChecklist[promise.id]
                                        ? 'bg-purple-50 border-purple-300'
                                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${promiseChecklist[promise.id]
                                        ? 'bg-purple-500'
                                        : 'border-2 border-slate-300'
                                        }`}>
                                        {promiseChecklist[promise.id] && <CheckCircle size={16} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-xs text-slate-400 font-bold">Janji #{idx + 1}</span>
                                        <p className={`font-medium ${promiseChecklist[promise.id] ? 'text-purple-700' : 'text-slate-600'}`}>
                                            {promise.promiseText}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Konfirmasi Konsumen */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        📞 Konfirmasi ke Konsumen
                    </h2>
                    <button
                        onClick={() => toggleChecklist('konfirmasiKonsumen')}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${checklist.konfirmasiKonsumen
                            ? 'bg-blue-50 border-blue-300'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${checklist.konfirmasiKonsumen
                            ? 'bg-blue-500'
                            : 'border-2 border-slate-300'
                            }`}>
                            {checklist.konfirmasiKonsumen && <CheckCircle size={16} className="text-white" />}
                        </div>
                        <span className={`font-medium ${checklist.konfirmasiKonsumen ? 'text-blue-700' : 'text-slate-600'}`}>
                            Sudah konfirmasi ke konsumen (Telp/WA)
                        </span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Progress Checklist</span>
                        <span className="text-sm font-bold text-slate-700">
                            {getProgress().checked} / {getProgress().total}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${allChecked() ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${(getProgress().checked / getProgress().total) * 100}%` }}
                        />
                    </div>
                    {!allChecked() && (
                        <p className="text-xs text-slate-400 mt-2">
                            Masih tersisa {getProgress().total - getProgress().checked} item yang belum dicentang
                        </p>
                    )}
                </div>

                {/* Warning */}
                {!allChecked() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            Mohon centang semua checklist sebelum konfirmasi kesiapan pengiriman.
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Save Temporary Button - always visible */}
                    {!allChecked() && (
                        <button
                            onClick={saveChecklistTemp}
                            className="w-full py-4 rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-600 font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                        >
                            💾 SIMPAN SEMENTARA
                        </button>
                    )}

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        disabled={!allChecked()}
                        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${allChecked()
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <CheckCircle size={22} />
                        KONFIRMASI SIAP KIRIM
                        <ArrowRight size={20} />
                    </button>
                </div>

                {/* Back Link */}
                <div className="text-center pt-4">
                    <button
                        onClick={() => navigate('/manager')}
                        className="text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    >
                        ← Kembali ke Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}
