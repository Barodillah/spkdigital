import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FileText,
    Download,
    Eye,
    ArrowLeft,
    Truck,
    Hash
} from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useSPK } from '../contexts/SPKContext';
import { validateSuratJalanForm } from '../utils/validation';
import { downloadSuratJalan, previewSuratJalan } from '../utils/pdfGenerator';

export default function SuratJalan() {
    const { spkId } = useParams();
    const navigate = useNavigate();
    const { getSPKById, getPromisesBySPKId, updateSuratJalan } = useSPK();

    const [spk, setSpk] = useState(null);
    const [promises, setPromises] = useState([]);
    const [chassisNo, setChassisNo] = useState('');
    const [engineNo, setEngineNo] = useState('');
    const [errors, setErrors] = useState({});
    const [notif, setNotif] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const data = getSPKById(spkId);
        if (!data) {
            navigate('/manager');
            return;
        }
        if (data.status !== 'VALID') {
            navigate(`/manager/validate/${spkId}`);
            return;
        }
        setSpk(data);
        setPromises(getPromisesBySPKId(spkId));
        setChassisNo(data.chassisNo || '');
        setEngineNo(data.engineNo || '');
    }, [spkId, getSPKById, getPromisesBySPKId, navigate]);

    const notify = (msg, type = 'success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const handlePreview = () => {
        const validation = validateSuratJalanForm({ chassisNo, engineNo });
        if (!validation.isValid) {
            setErrors(validation.errors);
            notify('Lengkapi No. Rangka dan No. Mesin', 'error');
            return;
        }

        // Save to SPK
        updateSuratJalan(spkId, chassisNo, engineNo);

        // Generate preview
        const updatedSpk = { ...spk, chassisNo, engineNo };
        const url = previewSuratJalan(updatedSpk, promises);
        setPreviewUrl(url);
    };

    const handleDownload = () => {
        const validation = validateSuratJalanForm({ chassisNo, engineNo });
        if (!validation.isValid) {
            setErrors(validation.errors);
            notify('Lengkapi No. Rangka dan No. Mesin', 'error');
            return;
        }

        // Save to SPK
        updateSuratJalan(spkId, chassisNo, engineNo);

        // Download PDF
        const updatedSpk = { ...spk, chassisNo, engineNo };
        downloadSuratJalan(updatedSpk, promises);
        notify('Surat Jalan berhasil diunduh!');
    };

    const updateField = (field, value) => {
        if (field === 'chassisNo') setChassisNo(value);
        if (field === 'engineNo') setEngineNo(value);
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
                backTo={`/manager/validate/${spkId}`}
                title="SURAT JALAN"
                subtitle={`SPK #${spk.spkNo}`}
            />

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <StatusBadge status={spk.status} size="lg" />
                    <div className="flex items-center gap-2 text-green-600">
                        <Truck size={18} />
                        <span className="text-sm font-bold">Siap Kirim</span>
                    </div>
                </div>

                {/* SPK Summary */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText size={14} /> Ringkasan SPK
                    </h2>
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
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Metode Bayar</p>
                            <p className="text-sm font-medium text-slate-700">{spk.paymentMethod}</p>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Alamat Pengiriman</p>
                        <p className="text-sm font-medium text-slate-700">{spk.address}</p>
                    </div>
                </div>

                {/* Vehicle Data Form */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Hash size={14} /> Data Kendaraan
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
                                onChange={(e) => updateField('chassisNo', e.target.value.toUpperCase())}
                            />
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
                                onChange={(e) => updateField('engineNo', e.target.value.toUpperCase())}
                            />
                        </div>
                    </div>
                </div>

                {/* Legal Note */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Catatan Penting</p>
                    <p className="text-xs text-amber-700">
                        Surat Jalan ini akan mencantumkan bahwa unit dikirim dalam kondisi
                        STNK masih dalam proses penerbitan oleh pihak berwenang.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handlePreview}
                        className="py-4 rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-600 font-bold text-base flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                    >
                        <Eye size={20} /> Preview
                    </button>
                    <button
                        onClick={handleDownload}
                        className="py-4 rounded-2xl bg-green-600 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg"
                    >
                        <Download size={20} /> Download PDF
                    </button>
                </div>

                {/* PDF Preview */}
                {previewUrl && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-100 p-3 flex items-center justify-between border-b">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Preview Surat Jalan
                            </span>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                Tutup
                            </button>
                        </div>
                        <iframe
                            src={previewUrl}
                            className="w-full h-[500px]"
                            title="Surat Jalan Preview"
                        />
                    </div>
                )}

                {/* Back Link */}
                <div className="text-center pt-4">
                    <button
                        onClick={() => navigate('/manager')}
                        className="text-sm text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center gap-1 mx-auto"
                    >
                        <ArrowLeft size={14} /> Kembali ke Dashboard
                    </button>
                </div>
            </main>
        </div>
    );
}
