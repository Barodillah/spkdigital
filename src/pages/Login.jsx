import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Delete, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/manager');
        }
    }, [isAuthenticated, navigate]);

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError('');
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (pin.length !== 4) return;

        setIsLoading(true);
        setError('');

        try {
            await login(pin);
            // Navigation handled by useEffect
        } catch (err) {
            setError(err.message || 'PIN Salah');
            setPin('');
        } finally {
            setIsLoading(false);
        }
    };

    // Auto submit when 4 digits entered
    useEffect(() => {
        if (pin.length === 4) {
            handleSubmit();
        }
    }, [pin]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-200">
                        <Shield size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800">MANAGER ACCESS</h1>
                    <p className="text-slate-500 font-medium mt-1">Masukkan PIN 4 digit untuk masuk</p>
                </div>

                {/* PIN Display */}
                <div className="mb-8 flex justify-center gap-4">
                    {[0, 1, 2, 3].map((idx) => (
                        <div
                            key={idx}
                            className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${pin[idx]
                                    ? 'border-blue-500 bg-white text-blue-600 shadow-lg shadow-blue-100'
                                    : 'border-slate-200 bg-slate-100 text-slate-300'
                                } ${error ? 'border-red-400 bg-red-50 text-red-500' : ''}`}
                        >
                            {pin[idx] ? '•' : ''}
                        </div>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-center mb-6 animate-pulse">
                        <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold">
                            {error}
                        </span>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center mb-6">
                        <span className="inline-flex items-center gap-2 text-blue-600 font-bold">
                            <Loader2 size={20} className="animate-spin" /> Verifikasi PIN...
                        </span>
                    </div>
                )}

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num)}
                            className="h-16 rounded-2xl bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 font-black text-2xl text-slate-700 hover:bg-slate-50 transition-all"
                            disabled={isLoading}
                        >
                            {num}
                        </button>
                    ))}
                    <div className="col-span-1"></div>
                    <button
                        onClick={() => handleNumberClick(0)}
                        className="h-16 rounded-2xl bg-white border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 font-black text-2xl text-slate-700 hover:bg-slate-50 transition-all"
                        disabled={isLoading}
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-16 rounded-2xl bg-slate-100 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
                        disabled={isLoading}
                    >
                        <Delete size={24} />
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                    >
                        Kembali ke Menu Utama
                    </button>
                </div>
            </div>
        </div>
    );
}
