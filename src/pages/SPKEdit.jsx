import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User,
    Package,
    Gift,
    ArrowRight,
    Phone,
    CreditCard,
    Calendar,
    Clock,
    FileCheck,
    Briefcase,
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    PenLine,
    Check,
    X
} from 'lucide-react';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import PromiseList from '../components/PromiseList';
import { useSPK } from '../contexts/SPKContext';
import { validateSalesForm } from '../utils/validation';

// Mitsubishi Unit Options
const UNIT_OPTIONS = [
    'Destinator GLS CVT',
    'Destinator Exceed CVT',
    'Destinator Ultimate CVT',
    'Destinator Ultimate Premium',
    'Xforce Exceed CVT',
    'Xforce Ultimate CVT',
    'Xforce Ultimate with Diamond Sense (DS)',
    'Pajero Sport GLX (4x4) MT',
    'Pajero Sport Exceed (4x2) MT',
    'Pajero Sport Exceed (4x2) AT',
    'Pajero Sport Dakar (4x2) AT',
    'Pajero Sport Dakar Ultimate (4x2) AT',
    'Pajero Sport Dakar Ultimate (4x4) AT',
    'Xpander GLS MT',
    'Xpander GLS CVT',
    'Xpander Exceed MT',
    'Xpander Exceed CVT',
    'Xpander Ultimate CVT',
    'Xpander Cross MT',
    'Xpander Cross Premium CVT',
    'Triton Single Cab GLX 4x2',
    'Triton Single Cab HDX 4x4',
    'Triton Double Cab HDX 4x4',
    'Triton Double Cab GLS 4x4',
    'Triton Double Cab Exceed 4x4',
    'Triton Double Cab Ultimate 4x4 AT',
    'L300 Pick-Up Flat Deck',
    'L300 Cab Chassis',
    'L100 EV (Minicab MiEV)',
];

// Mitsubishi Color Options
const COLOR_OPTIONS = [
    'Blade Silver Metallic',
    'Quartz White Pearl (Premium)',
    'Graphite Grey Metallic',
    'Jet Black Mica',
    'Jet Black Metallic',
    'Lunar Blue Mica (Destinator)',
    'Energetic Yellow Metallic (Xforce)',
    'Red Metallic (Xforce)',
    'Red Diamond (Xpander)',
    'Green Bronze Metallic (Xpander Cross)',
    'White Solid',
    'Black',
    'White Diamond (Triton Ultimate)',
    'Deep Bronze Metallic',
    'Two-Tone (Atap Hitam)',
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 2, currentYear, currentYear + 1];

const TIME_OPTIONS = [];
for (let h = 7; h <= 23; h++) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
}

const NOPOL_OPTIONS = [
    { value: 'bebas', label: 'Bebas' },
    { value: 'ganjil', label: 'Ganjil' },
    { value: 'genap', label: 'Genap' },
    { value: 'pilno_dibantu', label: 'Pilno Dibantu' },
    { value: 'pilno_sendiri', label: 'Pilno Urus Sendiri' },
];

const SPV_STORAGE_KEY = 'spkdigital_spv_list';

const loadActiveSPVOptions = () => {
    try {
        const data = localStorage.getItem(SPV_STORAGE_KEY);
        if (data) {
            const list = JSON.parse(data);
            return list.filter(spv => spv.active).map(spv => spv.name);
        }
    } catch (e) {
        console.error('Error loading SPV list:', e);
    }
    return ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko'];
};

export default function SPKEdit() {
    const { spkId } = useParams();
    const navigate = useNavigate();
    const { getSPKById, updateSPK, updatePromises, getPromisesBySPKId, isSPKNumberUnique } = useSPK();

    const [formData, setFormData] = useState(null);
    const [originalSpkNo, setOriginalSpkNo] = useState('');
    const [errors, setErrors] = useState({});
    const [notif, setNotif] = useState(null);
    const [spvOptions] = useState(loadActiveSPVOptions());
    const [loading, setLoading] = useState(true);
    const [newPromise, setNewPromise] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingText, setEditingText] = useState('');

    useEffect(() => {
        const spk = getSPKById(spkId);
        if (!spk) {
            navigate('/manager');
            return;
        }

        // Get promises for this SPK
        const promises = getPromisesBySPKId(spkId);

        // Set form data from existing SPK
        setFormData({
            spvName: spk.spvName || '',
            salesName: spk.salesName || '',
            custName: spk.custName || '',
            waNo: spk.waNo || '',
            altPhone: spk.altPhone || '',
            unitType: spk.unitType || UNIT_OPTIONS[0],
            color: spk.color || COLOR_OPTIONS[0],
            unitYear: spk.unitYear || currentYear,
            unitQty: spk.unitQty || 1,
            paymentMethod: spk.paymentMethod || 'Cash',
            spkNo: spk.spkNo || '',
            spkImage: spk.spkImage || null,
            consumerPhoto: spk.consumerPhoto || null,
            estimatedDeliveryDate: spk.estimatedDeliveryDate || '',
            estimatedDeliveryTime: spk.estimatedDeliveryTime || '10:00',
            stnkType: spk.stnkType || 'normal',
            stnkDays: spk.stnkDays || '',
            nopolType: spk.nopolType || 'bebas',
            nopolPilihan: spk.nopolPilihan || '',
            givenSuratJalan: spk.givenSuratJalan || false,
            promises: promises.map(p => ({ text: p.promiseText })),
        });
        setOriginalSpkNo(spk.spkNo);
        setLoading(false);
    }, [spkId, getSPKById, getPromisesBySPKId, navigate]);

    const notify = (msg, type = 'success') => {
        setNotif({ msg, type });
        setTimeout(() => setNotif(null), 3000);
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleAddPromise = () => {
        if (newPromise.trim()) {
            setFormData(prev => ({
                ...prev,
                promises: [...prev.promises, { text: newPromise.trim() }]
            }));
            setNewPromise('');
        }
    };

    const handleRemovePromise = (index) => {
        setFormData(prev => ({
            ...prev,
            promises: prev.promises.filter((_, i) => i !== index)
        }));
    };

    const handleEditPromise = (index) => {
        setEditingIndex(index);
        setEditingText(formData.promises[index].text);
    };

    const handleSaveEditPromise = () => {
        if (editingText.trim() && editingIndex !== null) {
            setFormData(prev => ({
                ...prev,
                promises: prev.promises.map((p, i) =>
                    i === editingIndex ? { text: editingText.trim() } : p
                )
            }));
            setEditingIndex(null);
            setEditingText('');
        }
    };

    const handleCancelEditPromise = () => {
        setEditingIndex(null);
        setEditingText('');
    };

    const handleSave = () => {
        // Basic validation
        if (!formData.custName?.trim()) {
            notify('Nama konsumen wajib diisi', 'error');
            return;
        }
        if (!formData.waNo?.trim()) {
            notify('No. WhatsApp wajib diisi', 'error');
            return;
        }
        if (!formData.spkNo?.trim()) {
            notify('Nomor SPK wajib diisi', 'error');
            return;
        }

        // Check SPK number uniqueness (only if changed)
        if (formData.spkNo !== originalSpkNo && !isSPKNumberUnique(formData.spkNo, spkId)) {
            notify('Nomor SPK sudah terdaftar dalam sistem', 'error');
            return;
        }

        // Update SPK data
        updateSPK(spkId, {
            spvName: formData.spvName,
            salesName: formData.salesName,
            custName: formData.custName,
            waNo: formData.waNo,
            altPhone: formData.altPhone,
            unitType: formData.unitType,
            color: formData.color,
            unitYear: formData.unitYear,
            unitQty: formData.unitQty,
            paymentMethod: formData.paymentMethod,
            spkNo: formData.spkNo,
            spkImage: formData.spkImage,
            consumerPhoto: formData.consumerPhoto,
            estimatedDeliveryDate: formData.estimatedDeliveryDate,
            estimatedDeliveryTime: formData.estimatedDeliveryTime,
            stnkType: formData.stnkType,
            stnkDays: formData.stnkDays,
            nopolType: formData.nopolType,
            nopolPilihan: formData.nopolPilihan,
            givenSuratJalan: formData.givenSuratJalan,
        });

        // Update promises
        updatePromises(spkId, formData.promises);

        notify('Data SPK berhasil diperbarui!');
        setTimeout(() => navigate('/manager'), 1500);
    };

    if (loading || !formData) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-8">
            {/* Notification */}
            {notif && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in max-w-[90%] ${notif.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                    <span className="font-medium text-sm">{notif.msg}</span>
                </div>
            )}

            <Header
                isManager
                title="EDIT SPK"
                subtitle={`#${formData.spkNo}`}
            />

            <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/manager')}
                    className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Kembali ke Dashboard
                </button>

                {/* Sales Data Section */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <Briefcase size={16} className="text-blue-500" /> Data Sales
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                NAMA SPV <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                value={formData.spvName}
                                onChange={(e) => updateField('spvName', e.target.value)}
                            >
                                <option value="" disabled>Pilih SPV</option>
                                {spvOptions.map(spv => (
                                    <option key={spv} value={spv}>{spv}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                NAMA SALES <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Nama Sales"
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                                value={formData.salesName}
                                onChange={(e) => updateField('salesName', e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Customer Profile Section */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <User size={16} className="text-blue-500" /> Profil Konsumen
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                NAMA LENGKAP (KTP) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan nama konsumen"
                                className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium ${errors.custName ? 'border-red-300 bg-red-50' : 'border-slate-100'}`}
                                value={formData.custName}
                                onChange={(e) => updateField('custName', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                    NO. WHATSAPP <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        placeholder="0812xxxx"
                                        className={`w-full p-4 pl-10 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium ${errors.waNo ? 'border-red-300 bg-red-50' : 'border-slate-100'}`}
                                        value={formData.waNo}
                                        onChange={(e) => updateField('waNo', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                    NO. TELP CADANGAN
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Opsional"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                                    value={formData.altPhone}
                                    onChange={(e) => updateField('altPhone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Unit Details Section */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <Package size={16} className="text-blue-500" /> Detail Unit & SPK
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">TIPE UNIT</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={formData.unitType}
                                    onChange={(e) => updateField('unitType', e.target.value)}
                                >
                                    {UNIT_OPTIONS.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">WARNA</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={formData.color}
                                    onChange={(e) => updateField('color', e.target.value)}
                                >
                                    {COLOR_OPTIONS.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">TAHUN KENDARAAN</label>
                                <select
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                    value={formData.unitYear}
                                    onChange={(e) => updateField('unitYear', parseInt(e.target.value))}
                                >
                                    {YEAR_OPTIONS.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">JUMLAH UNIT</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700"
                                    value={formData.unitQty}
                                    onChange={(e) => updateField('unitQty', parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">METODE BAYAR</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Cash', 'Kredit'].map(method => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => updateField('paymentMethod', method)}
                                        className={`p-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${formData.paymentMethod === method
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        <CreditCard size={16} />
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                NOMOR SPK FISIK <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ketik sesuai kertas SPK"
                                className={`w-full p-4 bg-blue-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono font-black text-blue-700 ${errors.spkNo ? 'border-red-300' : 'border-blue-200'}`}
                                value={formData.spkNo}
                                onChange={(e) => updateField('spkNo', e.target.value.toUpperCase())}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                ESTIMASI TANGGAL & JAM KIRIM
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        className="w-full p-4 pl-10 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                                        value={formData.estimatedDeliveryDate}
                                        onChange={(e) => updateField('estimatedDeliveryDate', e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select
                                        className="w-full p-4 pl-10 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                        value={formData.estimatedDeliveryTime}
                                        onChange={(e) => updateField('estimatedDeliveryTime', e.target.value)}
                                    >
                                        {TIME_OPTIONS.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <ImageUpload
                            label="FOTO LEMBAR SPK"
                            value={formData.spkImage}
                            onChange={(val) => updateField('spkImage', val)}
                            placeholder="Klik untuk foto SPK"
                        />

                        <ImageUpload
                            label="FOTO BERSAMA KONSUMEN"
                            value={formData.consumerPhoto}
                            onChange={(val) => updateField('consumerPhoto', val)}
                            placeholder="Klik untuk foto bersama konsumen"
                        />
                    </div>
                </section>

                {/* Administration Section */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <FileCheck size={16} className="text-blue-500" /> Administrasi
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">JANJI STNK</label>
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                value={formData.stnkType}
                                onChange={(e) => {
                                    updateField('stnkType', e.target.value);
                                    if (e.target.value === 'normal') {
                                        updateField('stnkDays', '');
                                    }
                                }}
                            >
                                <option value="normal">Normal 14 Hari Kerja</option>
                                <option value="percepatan">Percepatan</option>
                            </select>
                        </div>

                        {formData.stnkType === 'percepatan' && (
                            <div className="animate-fade-in">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">BERAPA HARI?</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="13"
                                    placeholder="Masukkan jumlah hari"
                                    className="w-full p-4 bg-amber-50 border border-amber-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-amber-700"
                                    value={formData.stnkDays}
                                    onChange={(e) => updateField('stnkDays', e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">NOMOR POLISI</label>
                            <select
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                                value={formData.nopolType}
                                onChange={(e) => {
                                    updateField('nopolType', e.target.value);
                                    if (e.target.value !== 'pilno_dibantu') {
                                        updateField('nopolPilihan', '');
                                    }
                                }}
                            >
                                {NOPOL_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {formData.nopolType === 'pilno_dibantu' && (
                            <div className="animate-fade-in">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">NOPOL PILIHAN</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: B 1234 XYZ"
                                    className="w-full p-4 bg-green-50 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-mono font-bold text-green-700 uppercase"
                                    value={formData.nopolPilihan}
                                    onChange={(e) => updateField('nopolPilihan', e.target.value.toUpperCase())}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">DIBERIKAN SURAT JALAN</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[{ value: true, label: 'Ya' }, { value: false, label: 'Tidak' }].map(option => (
                                    <button
                                        key={option.label}
                                        type="button"
                                        onClick={() => updateField('givenSuratJalan', option.value)}
                                        className={`p-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${formData.givenSuratJalan === option.value
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Promises Section - Editable */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <Gift size={16} className="text-blue-500" /> Janji Sales
                    </h2>

                    {/* Existing Promises */}
                    <div className="space-y-2 mb-4">
                        {formData.promises.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-3 bg-slate-50 rounded-xl">
                                <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {idx + 1}
                                </span>
                                {editingIndex === idx ? (
                                    // Edit mode
                                    <>
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border border-blue-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveEditPromise}
                                            className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={handleCancelEditPromise}
                                            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    // View mode
                                    <>
                                        <span className="flex-1 font-medium text-slate-700">{p.text}</span>
                                        <button
                                            onClick={() => handleEditPromise(idx)}
                                            className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-500"
                                            title="Edit janji"
                                        >
                                            <PenLine size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleRemovePromise(idx)}
                                            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500"
                                            title="Hapus janji"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                        {formData.promises.length === 0 && (
                            <p className="text-sm text-slate-400 text-center py-4 italic">
                                Belum ada janji sales
                            </p>
                        )}
                    </div>

                    {/* Add New Promise */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Tambah janji baru..."
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                            value={newPromise}
                            onChange={(e) => setNewPromise(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddPromise()}
                        />
                        <button
                            type="button"
                            onClick={handleAddPromise}
                            disabled={!newPromise.trim()}
                            className={`px-4 rounded-xl font-bold flex items-center gap-1 transition-all ${newPromise.trim()
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            <Plus size={18} /> Tambah
                        </button>
                    </div>
                </section>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-green-200 hover:bg-green-700 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                    <Save size={22} /> SIMPAN PERUBAHAN
                </button>
            </main>
        </div>
    );
}
