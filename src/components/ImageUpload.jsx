import React, { useRef, useState } from 'react';
import { Camera, Trash2, Image, Loader2 } from 'lucide-react';
import { compressAndConvert } from '../utils/imageCompress';

export default function ImageUpload({
    label,
    value,
    onChange,
    required = false,
    accept = "image/*",
    placeholder = "Klik untuk ambil foto"
}) {
    const inputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const base64 = await compressAndConvert(file);
            onChange(base64);
        } catch (error) {
            console.error('Error processing image:', error);
            // Fallback: read file directly
            const reader = new FileReader();
            reader.onloadend = () => onChange(reader.result);
            reader.readAsDataURL(file);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-1">
            {label && (
                <label className="text-xs font-bold text-slate-500 ml-1 block">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden transition-all hover:border-slate-400">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center bg-slate-50">
                        <Loader2 size={32} className="text-blue-500 animate-spin mb-2" />
                        <span className="text-xs text-slate-400 font-medium">Memproses foto...</span>
                    </div>
                ) : value ? (
                    <div className="relative">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full max-h-48 object-contain bg-slate-100"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ) : (
                    <label className="cursor-pointer block p-6 text-center hover:bg-slate-50 transition-colors">
                        <Camera size={32} className="mx-auto text-slate-300 mb-2" />
                        <span className="text-xs text-slate-400 font-bold block">{placeholder}</span>
                        <input
                            ref={inputRef}
                            type="file"
                            accept={accept}
                            capture="environment"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
