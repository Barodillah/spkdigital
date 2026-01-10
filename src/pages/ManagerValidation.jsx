import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle,
    XCircle,
    ZoomIn,
    User,
    Phone,
    Package,
    Calendar,
    Clock,
    FileText,
    Gift,
    Image,
    PenLine,
    ArrowRight,
    MessageSquare,
    FileCheck,
    Car,
    UserCheck,
    Users
} from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import { useSPK } from '../contexts/SPKContext';
import { getStnkLabel, getNopolLabel } from '../utils/validation';

export default function ManagerValidation() {
    const { spkId } = useParams();
    const navigate = useNavigate();
    const { getSPKById, getPromisesBySPKId, approveSPK, rejectSPK } = useSPK();

    const [spk, setSpk] = useState(null);
    const [promises, setPromises] = useState([]);
    const [rejectNote, setRejectNote] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(null);
    const [notif, setNotif] = useState(null);

    useEffect(() => {
        const data = getSPKById(spkId);
        if (!data) {
            navigate('/manager');
            return;
        }
        setSpk(data);
        setPromises(getPromisesBySPKId(spkId));
    }, [spkId, getSPKById, getPromisesBySPKId, navigate]);

    const notify = (msg, type = 'success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const handleApprove = () => {
        approveSPK(spkId);
        notify('SPK berhasil divalidasi!');
        setTimeout(() => navigate('/manager'), 1500);
    };

    const handleReject = () => {
        if (!rejectNote.trim()) {
            notify('Harap isi catatan penolakan', 'error');
            return;
        }
        rejectSPK(spkId, rejectNote);
        setShowRejectModal(false);
        notify('SPK ditolak dan dikembalikan ke Sales');
        setTimeout(() => navigate('/manager'), 1500);
    };

    if (!spk) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const options = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        };
        // Hanya ambil bagian tanggal, buang waktu jika ada
        return date.toLocaleDateString('id-ID', options).split(' pukul')[0];
    };

    const canValidate = spk.status === 'PENDING_VALIDATION';
    const isValid = spk.status === 'VALID';

    return (
        <div className="min-h-screen bg-slate-100 pb-8">
            {/* Notification */}
            {notif && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in max-w-[90%] ${notif.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                    <span className="font-medium text-sm">{notif.msg}</span>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImageModal(null)}
                >
                    <img
                        src={showImageModal}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
                    />
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-bounce-in">
                        <h3 className="text-lg font-black text-slate-800 mb-2">Tolak SPK?</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            SPK akan dikembalikan ke Sales untuk diperbaiki. Berikan catatan alasan penolakan:
                        </p>
                        <textarea
                            rows="3"
                            placeholder="Contoh: Janji tidak sesuai dengan foto SPK..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium mb-4"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                            >
                                Tolak SPK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Header
                isManager
                showBack
                backTo="/manager"
                title="VALIDASI SPK"
                subtitle={`#${spk.spkNo}`}
            />

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Status Bar */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status</p>
                        <StatusBadge status={spk.status} size="lg" />
                    </div>
                    {spk.validatedAt && (
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Divalidasi</p>
                            <p className="text-sm font-medium text-slate-600">{formatDate(spk.validatedAt)}</p>
                        </div>
                    )}
                </div>

                {/* Validation Note (if any) */}
                {spk.validationNote && (
                    <div className={`rounded-2xl p-4 border ${spk.status === 'REVISE'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                        }`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <MessageSquare size={12} /> Catatan Validasi
                        </p>
                        <p className="text-sm font-medium">{spk.validationNote}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column: Data Input */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Data Input Sales
                        </h2>

                        {/* Sales & SPV Info */}
                        {(spk.salesName || spk.spvName) && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
                                <div className="flex items-center gap-6">
                                    {spk.salesName && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <UserCheck size={16} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Sales</p>
                                                <p className="text-sm font-bold text-slate-800">{spk.salesName}</p>
                                            </div>
                                        </div>
                                    )}
                                    {spk.spvName && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Users size={16} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">SPV</p>
                                                <p className="text-sm font-bold text-slate-800">{spk.spvName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Customer Info */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-start gap-3">
                                <User size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Konsumen</p>
                                    <p className="text-base font-bold text-slate-800">{spk.custName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp</p>
                                    <p className="text-sm font-medium text-slate-700">{spk.waNo}</p>
                                    {spk.altPhone && (
                                        <p className="text-xs text-slate-500">Cadangan: {spk.altPhone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Unit Info */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                            <div className="flex items-start gap-3">
                                <Package size={18} className="text-slate-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Unit</p>
                                    <p className="text-base font-bold text-slate-800">{spk.unitType}</p>
                                    <p className="text-sm text-slate-500">{spk.color} • {spk.unitYear} • {spk.unitQty} unit</p>
                                    <p className="text-sm text-slate-500">{spk.paymentMethod}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar size={18} className="text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Estimasi Kirim</p>
                                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                        {formatDate(spk.estimatedDeliveryDate)}
                                        <Clock size={12} className="ml-1" />
                                        {spk.estimatedDeliveryTime}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Administration */}
                        <div className="bg-green-50 rounded-2xl p-5 border border-green-200 shadow-sm space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <FileCheck size={16} className="text-green-600" />
                                <p className="text-[10px] text-green-600 font-bold uppercase">Administrasi</p>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Janji STNK</span>
                                <span className="font-bold text-slate-800">{getStnkLabel(spk.stnkType, spk.stnkDays)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-1"><Car size={12} /> Nopol</span>
                                <span className="font-bold text-slate-800">{getNopolLabel(spk.nopolType, spk.nopolPilihan)}</span>
                            </div>
                            {spk.givenSuratJalan && (
                                <div className="flex items-center gap-2 text-sm font-bold text-green-700 pt-1">
                                    <CheckCircle size={14} /> Diberikan Surat Jalan
                                </div>
                            )}
                        </div>

                        {/* Promises */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <Gift size={18} className="text-slate-400" />
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Janji Sales</p>
                            </div>
                            {promises.length > 0 ? (
                                <div className="space-y-2">
                                    {promises.map((p, idx) => (
                                        <div key={p.id} className="flex items-center gap-2 text-sm">
                                            <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium text-slate-700">{p.promiseText}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Tidak ada janji tambahan</p>
                            )}
                        </div>

                        {/* Signature */}
                        {spk.signature && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <PenLine size={18} className="text-slate-400" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Tanda Tangan Konsumen</p>
                                </div>
                                <img
                                    src={spk.signature}
                                    alt="Tanda Tangan"
                                    className="max-h-24 border rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setShowImageModal(spk.signature)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column: Photos */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Image size={14} /> Foto Dokumen
                        </h2>

                        {/* SPK Photo */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Foto SPK Fisik</p>
                            {spk.spkImage ? (
                                <div
                                    className="relative cursor-pointer group"
                                    onClick={() => setShowImageModal(spk.spkImage)}
                                >
                                    <img
                                        src={spk.spkImage}
                                        alt="SPK"
                                        className="w-full rounded-xl border border-slate-200"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                                        <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <p className="text-slate-400 text-sm">Tidak ada foto</p>
                                </div>
                            )}
                        </div>

                        {/* KTP Photo */}
                        {spk.ktpImage && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">Foto KTP</p>
                                <div
                                    className="relative cursor-pointer group"
                                    onClick={() => setShowImageModal(spk.ktpImage)}
                                >
                                    <img
                                        src={spk.ktpImage}
                                        alt="KTP"
                                        className="w-full rounded-xl border border-slate-200"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                                        <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {canValidate && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={() => setShowRejectModal(true)}
                            className="py-4 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-base flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                        >
                            <XCircle size={20} /> REJECT
                        </button>
                        <button
                            onClick={handleApprove}
                            className="py-4 rounded-2xl bg-green-600 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg"
                        >
                            <CheckCircle size={20} /> APPROVE
                        </button>
                    </div>
                )}

                {/* Status-specific action buttons */}
                {isValid && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                        <p className="text-sm text-green-700 font-medium">
                            SPK sudah tervalidasi. Menunggu H-5 untuk konfirmasi kesiapan pengiriman.
                        </p>
                    </div>
                )}

                {spk.status === 'BUTUH_KONFIRMASI_KESIAPAN' && (
                    <button
                        onClick={() => navigate(`/manager/konfirmasi-kesiapan/${spkId}`)}
                        className="w-full py-5 rounded-2xl bg-orange-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors shadow-lg"
                    >
                        Konfirmasi Kesiapan <ArrowRight size={20} />
                    </button>
                )}

                {spk.status === 'SIAP_KIRIM' && (
                    <button
                        onClick={() => navigate(`/manager/pdi-matching/${spkId}`)}
                        className="w-full py-5 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        Input Data PDI <ArrowRight size={20} />
                    </button>
                )}

                {spk.status === 'PDI_MATCHED' && (
                    <button
                        onClick={() => navigate(`/manager/surat-jalan/${spkId}`)}
                        className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                        Cetak Surat Jalan <ArrowRight size={20} />
                    </button>
                )}
            </main>
        </div>
    );
}

