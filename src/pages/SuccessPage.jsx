import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, MessageCircle, Plus, Smartphone } from 'lucide-react';
import { useSPK } from '../contexts/SPKContext';

export default function SuccessPage() {
    const { spkId } = useParams();
    const navigate = useNavigate();
    const { getSPKById, getPromisesBySPKId } = useSPK();

    const [spk, setSpk] = useState(null);
    const [promises, setPromises] = useState([]);
    const [waStatus, setWaStatus] = useState('sending');

    useEffect(() => {
        const data = getSPKById(spkId);
        if (!data) {
            navigate('/');
            return;
        }
        setSpk(data);
        setPromises(getPromisesBySPKId(spkId));

        // Simulate WA sending
        const timer = setTimeout(() => {
            setWaStatus('sent');
        }, 2000);

        return () => clearTimeout(timer);
    }, [spkId, getSPKById, getPromisesBySPKId, navigate]);

    if (!spk) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    // Generate WA message
    const waMessage = `Halo ${spk.custName},

Terima kasih telah mempercayakan pembelian mobil Anda kepada kami.

📋 *Detail SPK Anda:*
• No. SPK: ${spk.spkNo}
• Unit: ${spk.unitType}
• Warna: ${spk.color}
• Metode: ${spk.paymentMethod}

${promises.length > 0 ? `🎁 *Janji yang Dikonfirmasi:*
${promises.map((p, i) => `${i + 1}. ${p.promiseText}`).join('\n')}` : ''}

Data SPK Anda sedang dalam proses validasi oleh tim kami. Kami akan menghubungi Anda kembali setelah validasi selesai.

Salam,
Tim Mitsubishi`;

    const handleOpenWA = () => {
        const phone = spk.waNo.startsWith('0')
            ? '62' + spk.waNo.substring(1)
            : spk.waNo;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-green-50 flex flex-col">
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
                <div className="text-center space-y-6 animate-bounce-in max-w-md">
                    {/* Success Icon */}
                    <div className="relative inline-block">
                        <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle size={70} className="text-green-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                            <ShieldCheck size={22} />
                        </div>
                    </div>

                    {/* Success Text */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">BERHASIL!</h1>
                        <p className="text-slate-500 font-medium">
                            Data SPK <span className="text-blue-600 font-bold">#{spk.spkNo}</span> telah berhasil
                            masuk ke sistem validasi Manager.
                        </p>
                    </div>

                    {/* WA Status */}
                    <div className={`p-4 rounded-2xl border transition-all ${waStatus === 'sent'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-slate-100 border-slate-200'
                        }`}>
                        <div className="flex items-center justify-center gap-2">
                            {waStatus === 'sending' ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Mengirim pesan WhatsApp...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <MessageCircle size={16} className="text-green-600" />
                                    <span className="text-xs font-bold text-green-700 uppercase tracking-widest">
                                        Pesan WA siap dikirim ke {spk.custName}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Open WA Button */}
                    <button
                        onClick={handleOpenWA}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-all"
                    >
                        <MessageCircle size={20} />
                        Buka WhatsApp untuk Kirim Pesan
                    </button>

                    {/* New SPK Button */}
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-black flex items-center justify-center gap-3 transition-all"
                    >
                        <Plus size={22} /> INPUT SPK BARU
                    </button>

                    {/* Manager Link */}
                    <button
                        onClick={() => navigate('/manager')}
                        className="text-xs text-slate-400 font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                        Buka Dashboard Manager →
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-sm border border-slate-100">
                    <Smartphone size={10} /> Secure Field Connection Active
                </div>
            </footer>
        </div>
    );
}
