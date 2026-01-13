// Format phone number for Indonesia
export function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    // If starts with 62, keep as is
    // If starts with 0, replace with 62
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    } else if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
    }
    return cleaned;
}

// Validate Indonesian phone number
export function isValidPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    // Indonesian phone numbers: 10-13 digits, starting with 08 or 628
    const regex = /^(08|628)\d{8,11}$/;
    return regex.test(cleaned);
}

// Validate required fields - Updated for new form structure
export function validateSalesForm(data) {
    const errors = {};

    if (!data.custName?.trim()) {
        errors.custName = 'Nama lengkap wajib diisi';
    }

    if (!data.waNo?.trim()) {
        errors.waNo = 'Nomor WhatsApp wajib diisi';
    } else if (!isValidPhoneNumber(data.waNo)) {
        errors.waNo = 'Nomor WhatsApp tidak valid';
    }

    if (!data.spkNo?.trim()) {
        errors.spkNo = 'Nomor SPK wajib diisi';
    }

    if (!data.spkImage) {
        errors.spkImage = 'Foto SPK wajib diunggah';
    }

    if (!data.estimatedDeliveryDate) {
        errors.estimatedDeliveryDate = 'Estimasi tanggal pengiriman wajib diisi';
    }

    if (!data.unitType?.trim()) {
        errors.unitType = 'Tipe unit wajib dipilih';
    }

    if (!data.color?.trim()) {
        errors.color = 'Warna wajib dipilih';
    }

    // Validate percepatan STNK days
    if (data.stnkType === 'percepatan' && !data.stnkDays) {
        errors.stnkDays = 'Jumlah hari percepatan wajib diisi';
    }

    // Validate nopol pilihan if pilno_dibantu
    if (data.nopolType === 'pilno_dibantu' && !data.nopolPilihan?.trim()) {
        errors.nopolPilihan = 'Nopol pilihan wajib diisi';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

// Validate manager form
export function validateSuratJalanForm(data) {
    const errors = {};

    if (!data.chassisNo?.trim()) {
        errors.chassisNo = 'Nomor rangka wajib diisi';
    }

    if (!data.engineNo?.trim()) {
        errors.engineNo = 'Nomor mesin wajib diisi';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

// Helper to get STNK label
export function getStnkLabel(stnkType, stnkDays) {
    if (stnkType === 'normal') {
        return 'Normal 14 Hari Kerja';
    }
    return `Percepatan ${stnkDays} Hari`;
}

// Helper to get Nopol label
export function getNopolLabel(nopolType, nopolPilihan) {
    const labels = {
        'bebas': 'Bebas',
        'ganjil': 'Ganjil',
        'genap': 'Genap',
        'pilno_dibantu': `Pilno Dibantu: ${nopolPilihan}`,
        'pilno_sendiri': 'Pilno Urus Sendiri',
    };
    return labels[nopolType] || nopolType;
}
