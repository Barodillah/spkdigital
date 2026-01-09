import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Camera
} from 'lucide-react';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import PromiseList from '../components/PromiseList';
import { useSPK } from '../contexts/SPKContext';
import { validateSalesForm } from '../utils/validation';

// Mitsubishi unit options
const UNIT_OPTIONS = [
    'Xpander Ultimate',
    'Xpander Cross',
    'Xpander Exceed',
    'Xpander GLS',
    'Pajero Sport Dakar Ultimate',
    'Pajero Sport Dakar',
    'Pajero Sport Exceed',
    'XForce Ultimate',
    'XForce Premium',
    'XForce Exceed',
    'L300 Pick Up',
    'L300 Box',
    'Triton HDX',
    'Triton GLX',
    'Outlander PHEV',
];

const COLOR_OPTIONS = [
    'Quartz White Pearl',
    'Jet Black Mica',
    'Graphite Gray Metallic',
    'Sterling Silver Metallic',
    'Red Metallic',
    'Deep Bronze Metallic',
    'Blade Silver Metallic',
    'Sunrise Orange Metallic',
];

// Generate year options (current year - 1 to current year + 1)
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

// Generate time options (07:00 - 23:00)
const TIME_OPTIONS = [];
for (let h = 7; h <= 23; h++) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
}

// Nopol options
const NOPOL_OPTIONS = [
    { value: 'bebas', label: 'Bebas' },
    { value: 'ganjil', label: 'Ganjil' },
    { value: 'genap', label: 'Genap' },
    { value: 'pilno_dibantu', label: 'Pilno Dibantu' },
    { value: 'pilno_sendiri', label: 'Pilno Urus Sendiri' },
];

export default function SalesForm() {
    const navigate = useNavigate();
    const { createSPK, isSPKNumberUnique } = useSPK();

    const [formData, setFormData] = useState({
        // Customer Profile
        custName: '',
        waNo: '',
        altPhone: '',
        // Unit Details
        unitType: UNIT_OPTIONS[0],
        color: COLOR_OPTIONS[0],
        unitYear: currentYear,
        unitQty: 1,
        paymentMethod: 'Cash',
        spkNo: '',
        spkImage: null,
        consumerPhoto: null, // Changed from ktpImage
        estimatedDeliveryDate: '',
        estimatedDeliveryTime: '10:00',
        // Administration
        stnkType: 'normal', // 'normal' or 'percepatan'
        stnkDays: '', // Only if percepatan
        nopolType: 'bebas',
        nopolPilihan: '', // Only if pilno_dibantu
        givenSuratJalan: false,
        // Promises
        promises: [],
    });

    const [newPromise, setNewPromise] = useState('');
    const [errors, setErrors] = useState({});
    const [notif, setNotif] = useState(null);

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

    const handleSubmit = () => {
        const validation = validateSalesForm(formData);

        if (!validation.isValid) {
            setErrors(validation.errors);
            const firstError = Object.values(validation.errors)[0];
            notify(firstError, 'error');
            return;
        }

        if (!isSPKNumberUnique(formData.spkNo)) {
            setErrors({ spkNo: 'Nomor SPK sudah terdaftar' });
            notify('Nomor SPK sudah terdaftar dalam sistem', 'error');
            return;
        }

        const spkId = createSPK(formData);
        navigate(`/confirm/${spkId}`);
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

            <Header status="Input Sales" />

            <main className="max-w-lg mx-auto px-4 mt-6 space-y-6">
                {/* Customer Profile Section - Removed Alamat */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-slide-up">
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
                                className={`w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium ${errors.custName ? 'border-red-300 bg-red-50' : 'border-slate-100'
                                    }`}
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
                                        className={`w-full p-4 pl-10 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium ${errors.waNo ? 'border-red-300 bg-red-50' : 'border-slate-100'
                                            }`}
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

                {/* Unit Details Section - Added Year, Qty, Time */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-slide-up">
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
                                className={`w-full p-4 bg-blue-50 border rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono font-black text-blue-700 ${errors.spkNo ? 'border-red-300' : 'border-blue-200'
                                    }`}
                                value={formData.spkNo}
                                onChange={(e) => updateField('spkNo', e.target.value.toUpperCase())}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                ESTIMASI TANGGAL & JAM KIRIM <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        className={`w-full p-4 pl-10 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium ${errors.estimatedDeliveryDate ? 'border-red-300 bg-red-50' : 'border-slate-100'
                                            }`}
                                        value={formData.estimatedDeliveryDate}
                                        onChange={(e) => updateField('estimatedDeliveryDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
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
                            required
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

                {/* Administration Section - NEW */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-slide-up">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <FileCheck size={16} className="text-blue-500" /> Administrasi
                    </h2>

                    <div className="space-y-4">
                        {/* STNK Type */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                JANJI STNK <span className="text-red-500">*</span>
                            </label>
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

                        {/* STNK Days - Only if percepatan */}
                        {formData.stnkType === 'percepatan' && (
                            <div className="animate-fade-in">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                    BERAPA HARI? <span className="text-red-500">*</span>
                                </label>
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

                        {/* Nopol Type */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                NOMOR POLISI <span className="text-red-500">*</span>
                            </label>
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

                        {/* Nopol Pilihan - Only if pilno_dibantu */}
                        {formData.nopolType === 'pilno_dibantu' && (
                            <div className="animate-fade-in">
                                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">
                                    NOPOL PILIHAN <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: B 1234 XYZ"
                                    className="w-full p-4 bg-green-50 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-mono font-bold text-green-700 uppercase"
                                    value={formData.nopolPilihan}
                                    onChange={(e) => updateField('nopolPilihan', e.target.value.toUpperCase())}
                                />
                            </div>
                        )}

                        {/* Surat Jalan Checkbox */}
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input
                                type="checkbox"
                                id="suratJalan"
                                checked={formData.givenSuratJalan}
                                onChange={(e) => updateField('givenSuratJalan', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="suratJalan" className="text-sm font-bold text-slate-700 cursor-pointer">
                                Diberikan Surat Jalan
                            </label>
                        </div>

                        {/* BBN Warning */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                            <p className="text-sm text-amber-800">
                                <strong className="font-black">BBN &amp; Progresif STNK ditanggung konsumen</strong>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Promises Section */}
                <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 animate-slide-up">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-5">
                        <Gift size={16} className="text-blue-500" /> Janji Tambahan Sales
                    </h2>

                    <PromiseList
                        promises={formData.promises}
                        onAdd={handleAddPromise}
                        onRemove={handleRemovePromise}
                        newPromise={newPromise}
                        onNewPromiseChange={setNewPromise}
                    />
                </section>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                    LANJUT KONFIRMASI <ArrowRight size={22} />
                </button>
            </main>
        </div>
    );
}
