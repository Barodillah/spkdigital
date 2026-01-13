import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function DateInput({ value, onChange, placeholder = 'Pilih tanggal', className = '', minDate = null, error = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (value) return new Date(value);
        return new Date();
    });
    const inputRef = useRef(null);
    const pickerRef = useRef(null);

    // Parse the current value
    const selectedDate = value ? new Date(value) : null;

    // Parse min date
    const minDateObj = minDate ? new Date(minDate) : null;

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(e.target) &&
                inputRef.current &&
                !inputRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    // Get days in current month view
    const getDaysInMonth = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days = [];

        // Previous month's days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }

        // Next month's days
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }

        return days;
    };

    const isDateDisabled = (date) => {
        if (!minDateObj) return false;
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const minOnly = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
        return dateOnly < minOnly;
    };

    const handleDateSelect = (date) => {
        if (isDateDisabled(date)) return;
        const formattedDate = date.toISOString().split('T')[0];
        onChange(formattedDate);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        const today = new Date();
        if (!isDateDisabled(today)) {
            setViewDate(today);
            handleDateSelect(today);
        }
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const days = getDaysInMonth();

    return (
        <div className="relative">
            {/* Input Display */}
            <div
                ref={inputRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-4 pl-10 bg-slate-50 border rounded-2xl cursor-pointer flex items-center transition-all hover:bg-slate-100 ${isOpen ? 'ring-2 ring-blue-500' : ''} ${error ? 'border-red-300 bg-red-50' : 'border-slate-100'} ${className}`}
            >
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <span className={`font-medium ${value ? 'text-slate-700' : 'text-slate-400'}`}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
            </div>

            {/* Hidden native input for form compatibility */}
            <input
                type="hidden"
                value={value || ''}
            />

            {/* Date Picker Dropdown */}
            {isOpen && createPortal(
                <div
                    ref={pickerRef}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                    onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-4 w-full max-w-[320px] animate-fade-in">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <ChevronLeft size={20} className="text-slate-600" />
                            </button>
                            <div className="text-center">
                                <p className="font-bold text-slate-800">
                                    {MONTHS[viewDate.getMonth()]}
                                </p>
                                <p className="text-xs text-slate-400">{viewDate.getFullYear()}</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <ChevronRight size={20} className="text-slate-600" />
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map(day => (
                                <div key={day} className="text-center text-xs font-bold text-slate-400 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((item, index) => {
                                const disabled = isDateDisabled(item.date);
                                return (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => handleDateSelect(item.date)}
                                        disabled={disabled}
                                        className={`
                                            aspect-square rounded-xl text-sm font-medium transition-all
                                            flex items-center justify-center
                                            ${!item.isCurrentMonth ? 'text-slate-300' : disabled ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-blue-50'}
                                            ${isToday(item.date) && !isSelected(item.date) ? 'bg-slate-100 font-bold' : ''}
                                            ${isSelected(item.date) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                                        `}
                                    >
                                        {item.day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                onClick={handleToday}
                                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                            >
                                Hari Ini
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
