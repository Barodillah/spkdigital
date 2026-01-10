import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    User,
    Package,
    Phone,
    Calendar,
    Clock,
    CheckCircle,
    Send,
    AlertCircle,
    FileCheck,
    Car
} from 'lucide-react';
import Header from '../components/Header';
import SignaturePad from '../components/SignaturePad';
import PromiseList from '../components/PromiseList';
import { useSPK } from '../contexts/SPKContext';
import { getStnkLabel, getNopolLabel } from '../utils/validation';

export default function ConsumerConfirm() {
    const { spkId } = useParams();
    const navigate = useNavigate();
    const { getSPKById, getPromisesBySPKId, confirmPromise, submitSPK } = useSPK();

    const [spk, setSpk] = useState(null);
    const [promises, setPromises] = useState([]);
    const [signature, setSignature] = useState(null);
    const [notif, setNotif] = useState(null);

    useEffect(() => {
        const data = getSPKById(spkId);
        if (!data) {
            navigate('/');
            return;
        }
        setSpk(data);
        setPromises(getPromisesBySPKId(spkId));
    }, [spkId, getSPKById, getPromisesBySPKId, navigate]);

    const notify = (msg, type = 'success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const handleConfirmPromise = (promiseId, confirmed) => {
        confirmPromise(promiseId, confirmed);
        setPromises(prev =>
            prev.map(p => p.id === promiseId ? { ...p, confirmed } : p)
        );
    };

    const handleSubmit = () => {
        const allConfirmed = promises.length === 0 || promises.every(p => p.confirmed);

        if (!allConfirmed) {
            notify('Harap konfirmasi semua janji sales terlebih dahulu', 'error');
            return;
        }

        if (!signature) {
            notify('Tanda tangan konsumen wajib diisi', 'error');
            return;
        }

        submitSPK(spkId, signature);
        navigate(`/success/${spkId}`);
    };

    if (!spk) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

    return (
        <div className="min-h-screen bg-slate-50 pb-8">
            {/* Notification */}
            {notif && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in max-w-[90%] ${notif.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
                    }`}>
                    <span className="font-medium text-sm">{notif.msg}</span>
                </div>
            )}

            <Header status="Konfirmasi" />

            <main className="max-w-lg mx-auto px-4 mt-6 space-y-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                    <ChevronLeft size={16} /> Kembali Edit Data
                </button>

                {/* Main Confirmation Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-bounce-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                        <h2 className="text-xl font-black tracking-tight">Verifikasi Akhir</h2>
                        <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest flex items-center gap-2">
                            <Phone size={12} /> Silakan serahkan ponsel ke Konsumen
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Alert with BBN warning */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold text-amber-800">Perhatian untuk Konsumen</p>
                                <p className="text-amber-700 text-xs mt-1">
                                    Pastikan Anda memeriksa data di bawah ini dengan teliti sebelum menandatangani.
                                </p>
                                <p className="text-amber-900 text-xs mt-2">
                                    <strong className="font-black">BBN &amp; Progresif STNK ditanggung konsumen</strong>
                                </p>
                            </div>
                        </div>

                        {/* Customer Summary */}
                        <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                    <User size={10} /> Nama Konsumen
                                </span>
                                <span className="text-sm font-bold text-slate-800">{spk.custName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">No. SPK</span>
                                <span className="text-sm font-black text-blue-600">{spk.spkNo}</span>
                            </div>
                        </div>

                        {/* Unit Details */}
                        <div className="bg-blue-50 p-5 rounded-2xl space-y-3 border border-blue-100">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                                <Package size={10} /> Detail Unit
                            </h4>
                            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Tipe Unit</span>
                                <span className="text-sm font-bold text-slate-800">{spk.unitType}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Warna</span>
                                <span className="text-sm font-bold text-slate-800">{spk.color}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Tahun</span>
                                <span className="text-sm font-bold text-slate-800">{spk.unitYear}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Jumlah Unit</span>
                                <span className="text-sm font-bold text-slate-800">{spk.unitQty} unit</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Metode Bayar</span>
                                <span className="text-sm font-bold text-slate-800">{spk.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                    <Calendar size={10} /> Estimasi Kirim
                                </span>
                                <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                    {formatDate(spk.estimatedDeliveryDate)}
                                    <Clock size={12} className="ml-1" />
                                    {spk.estimatedDeliveryTime}
                                </span>
                            </div>
                        </div>

                        {/* Administration Details */}
                        <div className="bg-green-50 p-5 rounded-2xl space-y-3 border border-green-100">
                            <h4 className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1">
                                <FileCheck size={10} /> Administrasi
                            </h4>
                            <div className="flex justify-between items-center border-b border-green-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Janji STNK</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {getStnkLabel(spk.stnkType, spk.stnkDays)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-green-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                    <Car size={10} /> Nomor Polisi
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                    {getNopolLabel(spk.nopolType, spk.nopolPilihan)}
                                </span>
                            </div>
                            {spk.givenSuratJalan && (
                                <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                                    <CheckCircle size={14} /> Diberikan Surat Jalan
                                </div>
                            )}
                        </div>

                        {/* Promise Confirmation */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-500" /> Konfirmasi Janji Sales
                            </h3>
                            <p className="text-xs text-slate-500">
                                Centang setiap janji untuk mengonfirmasi bahwa sales sudah menjelaskan:
                            </p>
                            <PromiseList
                                promises={promises}
                                readOnly
                                showConfirmation
                                onConfirm={handleConfirmPromise}
                            />
                        </div>

                        {/* Signature Pad */}
                        <div className="space-y-3 pt-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                ✍️ Tanda Tangan Konsumen
                            </h3>
                            <SignaturePad
                                onSave={(data) => setSignature(data)}
                                onClear={() => setSignature(null)}
                            />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                * Dengan menandatangani, saya menyatakan bahwa data di atas sudah benar dan
                                janji sales sudah dikonfirmasi secara transparan.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-700 flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-4"
                        >
                            SIMPAN & KIRIM <Send size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
