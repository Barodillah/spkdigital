import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package,
    Hash,
    CheckCircle,
    User,
    Truck,
    ArrowRight,
    FileText,
    AlertTriangle,
    UserCheck,
    Users
} from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useSPK } from '../contexts/SPKContext';

export default function PDIMatching() {
    const { spkId } = useParams();
    const navigate = useNavigate();
    const { getSPKById, matchPDI } = useSPK();

    const [spk, setSpk] = useState(null);
    const [chassisNo, setChassisNo] = useState('');
    const [engineNo, setEngineNo] = useState('');
    const [errors, setErrors] = useState({});
    const [notif, setNotif] = useState(null);

    useEffect(() => {
        const data = getSPKById(spkId);
        if (!data) {
            navigate('/manager');
            return;
        }
        if (data.status !== 'SIAP_KIRIM') {
            navigate(`/manager/validate/${spkId}`);
            return;
        }
        setSpk(data);
        setChassisNo(data.chassisNo || '');
        setEngineNo(data.engineNo || '');
    }, [spkId, getSPKById, navigate]);

    const notify = (msg, type = 'success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!chassisNo.trim()) {
            newErrors.chassisNo = 'Nomor rangka wajib diisi';
        } else if (chassisNo.length < 10) {
            newErrors.chassisNo = 'Nomor rangka minimal 10 karakter';
        }
        if (!engineNo.trim()) {
            newErrors.engineNo = 'Nomor mesin wajib diisi';
        } else if (engineNo.length < 5) {
            newErrors.engineNo = 'Nomor mesin minimal 5 karakter';
        }
        return newErrors;
    };

    const handleMatch = () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            notify('Lengkapi data PDI dengan benar', 'error');
            return;
        }

        matchPDI(spkId, chassisNo, engineNo);
        notify('Data PDI berhasil di-matching!');
        setTimeout(() => navigate(`/manager/surat-jalan/${spkId}`), 1500);
    };

    const updateField = (field, value) => {
        if (field === 'chassisNo') setChassisNo(value.toUpperCase());
        if (field === 'engineNo') setEngineNo(value.toUpperCase());
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    if (!spk) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

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
                title="PDI MATCHING"
                subtitle={`SPK #${spk.spkNo}`}
            />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <StatusBadge status={spk.status} size="lg" />
                    <div className="flex items-center gap-2 text-blue-600">
                        <Truck size={18} />
                        <span className="text-sm font-bold">Siap Kirim</span>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <Package size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-blue-800 mb-1">
                                Matching Data PDI
                            </p>
                            <p className="text-xs text-blue-700">
                                Input nomor rangka dan nomor mesin dari data PDI yang diterima untuk melengkapi dokumen surat jalan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* SPK Summary */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText size={14} /> Ringkasan SPK
                    </h2>
                    {/* Sales & SPV Info */}
                    {(spk.salesName || spk.spvName) && (
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl mb-4">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Konsumen</p>
                            <p className="text-sm font-bold text-slate-800">{spk.custName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Unit</p>
                            <p className="text-sm font-bold text-slate-800">{spk.unitType}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Warna</p>
                            <p className="text-sm font-medium text-slate-700">{spk.color}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Tahun</p>
                            <p className="text-sm font-medium text-slate-700">{spk.unitYear}</p>
                        </div>
                    </div>
                </div>

                {/* PDI Data Form */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Hash size={14} /> Data PDI
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                NOMOR RANGKA <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: MHKA5DA2JKJ012345"
                                className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono font-bold uppercase ${errors.chassisNo ? 'border-red-300 bg-red-50' : 'border-slate-100'
                                    }`}
                                value={chassisNo}
                                onChange={(e) => updateField('chassisNo', e.target.value)}
                            />
                            {errors.chassisNo && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.chassisNo}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                NOMOR MESIN <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: 4A91-CK12345"
                                className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-mono font-bold uppercase ${errors.engineNo ? 'border-red-300 bg-red-50' : 'border-slate-100'
                                    }`}
                                value={engineNo}
                                onChange={(e) => updateField('engineNo', e.target.value)}
                            />
                            {errors.engineNo && (
                                <p className="text-xs text-red-500 mt-1 ml-1">{errors.engineNo}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Validation Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800 mb-1">Pastikan Data Benar</p>
                        <p className="text-xs text-amber-700">
                            Data nomor rangka dan mesin akan digunakan untuk cetak surat jalan resmi. Pastikan sesuai dengan dokumen PDI yang diterima.
                        </p>
                    </div>
                </div>

                {/* Match Button */}
                <button
                    onClick={handleMatch}
                    className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg"
                >
                    <CheckCircle size={22} />
                    MATCHING PDI
                    <ArrowRight size={20} />
                </button>

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
