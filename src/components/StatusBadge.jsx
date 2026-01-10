import React from 'react';
import { Clock, CheckCircle, AlertCircle, FileEdit, Bell, Truck, Package } from 'lucide-react';

const STATUS_CONFIG = {
    DRAFT: {
        label: 'Draft',
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: FileEdit,
    },
    PENDING_VALIDATION: {
        label: 'Menunggu Validasi',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Clock,
    },
    VALID: {
        label: 'Tervalidasi',
        color: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircle,
    },
    REVISE: {
        label: 'Perlu Revisi',
        color: 'bg-red-50 text-red-700 border-red-200',
        icon: AlertCircle,
    },
    BUTUH_KONFIRMASI_KESIAPAN: {
        label: 'Butuh Konfirmasi',
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: Bell,
    },
    SIAP_KIRIM: {
        label: 'Siap Kirim',
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Truck,
    },
    PDI_MATCHED: {
        label: 'PDI Matched',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Package,
    },
};

export default function StatusBadge({ status, size = 'md' }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5 gap-1',
        md: 'text-xs px-3 py-1 gap-1.5',
        lg: 'text-sm px-4 py-1.5 gap-2',
    };

    const iconSizes = {
        sm: 10,
        md: 12,
        lg: 14,
    };

    return (
        <span className={`
      inline-flex items-center font-bold uppercase tracking-wider
      border rounded-full ${config.color} ${sizeClasses[size]}
    `}>
            <Icon size={iconSizes[size]} />
            {config.label}
        </span>
    );
}
