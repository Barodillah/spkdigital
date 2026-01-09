import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  User, 
  CheckCircle, 
  XCircle, 
  Camera, 
  Signature, 
  Plus, 
  Trash2, 
  Send,
  ArrowRight,
  ChevronLeft,
  Smartphone,
  ShieldCheck,
  Package,
  MapPin
} from 'lucide-react';

// --- Komponen Tanda Tangan ---
const SignaturePad = ({ onSave, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b'; // Slate 800
  }, []);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    onSave(canvas.toDataURL());
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        width={400}
        height={180}
        className="border-2 border-dashed border-slate-300 rounded-xl w-full bg-slate-50 touch-none cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button 
        type="button" 
        onClick={clear}
        className="mt-2 text-xs text-red-500 font-bold flex items-center gap-1 hover:bg-red-50 p-1 rounded"
      >
        <Trash2 size={14} /> HAPUS TANDA TANGAN
      </button>
    </div>
  );
};

// --- Aplikasi Utama ---
export default function App() {
  const [step, setStep] = useState(1); // 1: Input Sales, 2: Konfirmasi Konsumen, 3: Success
  const [currentSPK, setCurrentSPK] = useState({
    custName: '',
    waNo: '',
    address: '',
    unitType: 'Xpander Ultimate',
    color: 'Quartz White Pearl',
    paymentMethod: 'Cash',
    spkNo: '',
    spkImage: null,
    promises: [],
    signature: null,
  });

  const [newPromise, setNewPromise] = useState('');
  const [notif, setNotif] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const handleAddPromise = () => {
    if (newPromise.trim()) {
      setCurrentSPK({
        ...currentSPK,
        promises: [...currentSPK.promises, { text: newPromise, confirmed: false }]
      });
      setNewPromise('');
    }
  };

  const handleRemovePromise = (index) => {
    const updated = [...currentSPK.promises];
    updated.splice(index, 1);
    setCurrentSPK({ ...currentSPK, promises: updated });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentSPK({ ...currentSPK, spkImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndGoToConfirm = () => {
    if (!currentSPK.spkNo || !currentSPK.custName || !currentSPK.waNo) {
      notify('Harap lengkapi Nama, WA, dan No. SPK fisik', 'error');
      return;
    }
    if (!currentSPK.spkImage) {
      notify('Foto lembar SPK wajib diunggah', 'error');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const finalizeSubmission = () => {
    if (!currentSPK.signature) {
      notify('Konsumen wajib menandatangani dokumen', 'error');
      return;
    }
    // Di sini biasanya data dikirim ke backend/database
    setStep(3);
    window.scrollTo(0, 0);
  };

  const resetAll = () => {
    setCurrentSPK({
      custName: '',
      waNo: '',
      address: '',
      unitType: 'Xpander Ultimate',
      color: 'Quartz White Pearl',
      paymentMethod: 'Cash',
      spkNo: '',
      spkImage: null,
      promises: [],
      signature: null,
    });
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Notifikasi */}
      {notif && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 w-[90%] max-w-sm ${notif.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
          {notif.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} className="text-green-400" />}
          <span className="font-medium text-sm">{notif.msg}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-red-600 font-black text-lg italic tracking-tighter">
            <ShieldCheck size={24} />
            <span>DIGITAL SPK</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
            <div className={`w-2 h-2 rounded-full ${step === 3 ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {step === 1 ? 'Input Sales' : step === 2 ? 'Konfirmasi' : 'Selesai'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6">
        
        {/* LANGKAH 1: FORM INPUT SALES */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-5">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <User size={16} className="text-blue-500" /> Profil Konsumen
              </h2>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">NAMA LENGKAP (KTP)</label>
                  <input 
                    type="text" 
                    placeholder="Masukkan nama konsumen"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium"
                    value={currentSPK.custName}
                    onChange={(e) => setCurrentSPK({...currentSPK, custName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">NOMOR WHATSAPP</label>
                  <input 
                    type="tel" 
                    placeholder="0812xxxx"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium"
                    value={currentSPK.waNo}
                    onChange={(e) => setCurrentSPK({...currentSPK, waNo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">ALAMAT PENGIRIMAN</label>
                  <textarea 
                    rows="3"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium text-sm"
                    placeholder="Alamat detail untuk unit..."
                    value={currentSPK.address}
                    onChange={(e) => setCurrentSPK({...currentSPK, address: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-5">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Package size={16} className="text-blue-500" /> Detail Unit & SPK
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">TIPE UNIT</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none"
                    value={currentSPK.unitType}
                    onChange={(e) => setCurrentSPK({...currentSPK, unitType: e.target.value})}
                  >
                    <option>Xpander Ultimate</option>
                    <option>Pajero Sport Dakar</option>
                    <option>XForce Premium</option>
                    <option>L300 Pick Up</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">METODE BAYAR</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cash', 'Kredit'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setCurrentSPK({...currentSPK, paymentMethod: m})}
                        className={`p-3 rounded-xl border font-bold text-sm transition-all ${currentSPK.paymentMethod === m ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">NOMOR SPK FISIK</label>
                  <input 
                    type="text" 
                    placeholder="Ketik sesuai kertas SPK"
                    className="w-full p-4 bg-blue-50 border border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono font-black text-blue-700"
                    value={currentSPK.spkNo}
                    onChange={(e) => setCurrentSPK({...currentSPK, spkNo: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">FOTO LEMBAR SPK</label>
                  <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                    {currentSPK.spkImage ? (
                      <div className="relative inline-block">
                        <img src={currentSPK.spkImage} className="max-h-40 rounded-xl shadow-lg border" alt="Preview SPK" />
                        <button 
                          onClick={() => setCurrentSPK({...currentSPK, spkImage: null})} 
                          className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Camera size={32} className="mx-auto text-slate-300 mb-2" />
                        <span className="text-xs text-slate-400 font-bold block">Klik untuk Ambil Foto</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Plus size={16} className="text-blue-500" /> Janji Tambahan Sales
              </h2>
              
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Contoh: Kaca film 40%..."
                  className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  value={newPromise}
                  onChange={(e) => setNewPromise(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPromise()}
                />
                <button 
                  onClick={handleAddPromise}
                  className="bg-slate-800 text-white p-4 rounded-2xl hover:bg-black transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {currentSPK.promises.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-left-2">
                    <span className="text-sm font-semibold text-slate-700 italic">"{p.text}"</span>
                    <button onClick={() => handleRemovePromise(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <button 
              onClick={validateAndGoToConfirm}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              LANJUT KONFIRMASI <ArrowRight size={22} />
            </button>
          </div>
        )}

        {/* LANGKAH 2: VERIFIKASI & TANDA TANGAN KONSUMEN */}
        {step === 2 && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-widest mb-2"
            >
              <ChevronLeft size={16} /> Kembali Edit Data
            </button>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white">
                <h2 className="text-xl font-black tracking-tight">Verifikasi Akhir</h2>
                <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest">Silakan serahkan ponsel ke Konsumen</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Ringkasan Data */}
                <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Nama Konsumen</span>
                    <span className="text-sm font-bold text-slate-800">{currentSPK.custName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">No. SPK</span>
                    <span className="text-sm font-black text-blue-600">{currentSPK.spkNo}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Unit</span>
                    <span className="text-sm font-bold text-slate-800">{currentSPK.unitType}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-500 leading-relaxed">{currentSPK.address}</span>
                  </div>
                </div>

                {/* Konfirmasi Janji */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle size={14} className="text-green-500" /> Cek Janji Sales
                  </h3>
                  <div className="space-y-2">
                    {currentSPK.promises.length > 0 ? currentSPK.promises.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                           <CheckCircle size={12} className="text-green-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{p.text}</span>
                      </div>
                    )) : (
                      <div className="text-center p-4 bg-slate-50 rounded-2xl border border-dashed text-xs text-slate-400 font-bold italic">
                        Tidak ada janji tambahan yang dicatat
                      </div>
                    )}
                  </div>
                </div>

                {/* Pad Tanda Tangan */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Signature size={14} className="text-blue-500" /> Tanda Tangan Konsumen
                  </h3>
                  <SignaturePad 
                    onSave={(data) => setCurrentSPK({...currentSPK, signature: data})}
                    onClear={() => setCurrentSPK({...currentSPK, signature: null})}
                  />
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2 italic">
                    * Dengan menandatangani, saya menyatakan bahwa data di atas sudah benar dan janji sales sudah dikonfirmasi secara transparan.
                  </p>
                </div>

                <button 
                  onClick={finalizeSubmission}
                  className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-green-100 hover:bg-green-700 flex items-center justify-center gap-3 mt-4"
                >
                  SIMPAN & KIRIM <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LANGKAH 3: SUCCESS STATE */}
        {step === 3 && (
          <div className="text-center space-y-8 py-10 animate-in zoom-in-90 duration-500">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={60} className="text-green-600 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                <ShieldCheck size={20} />
              </div>
            </div>
            
            <div className="space-y-2 px-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">BERHASIL!</h1>
              <p className="text-slate-500 font-medium">Data SPK <span className="text-blue-600 font-bold">#{currentSPK.spkNo}</span> telah berhasil masuk ke sistem validasi Manager.</p>
              <div className="bg-slate-100 p-4 rounded-2xl mt-6 text-xs text-slate-500 font-bold uppercase tracking-widest border border-slate-200">
                Pesan WA konfirmasi sedang dikirim ke {currentSPK.custName}...
              </div>
            </div>

            <button 
              onClick={resetAll}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-xl hover:bg-black transition-all"
            >
              INPUT SPK BARU
            </button>
          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="mt-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
          <Smartphone size={10} /> Secure Field Connection Active
        </div>
      </footer>
    </div>
  );
}
