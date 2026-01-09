const STORAGE_KEYS = {
    SPK_RECORDS: 'spk_records',
    SPK_PROMISES: 'spk_promises',
};

export function loadSPKRecords() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SPK_RECORDS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading SPK records:', error);
        return [];
    }
}

export function saveSPKRecords(records) {
    try {
        localStorage.setItem(STORAGE_KEYS.SPK_RECORDS, JSON.stringify(records));
    } catch (error) {
        console.error('Error saving SPK records:', error);
    }
}

export function loadSPKPromises() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SPK_PROMISES);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading SPK promises:', error);
        return [];
    }
}

export function saveSPKPromises(promises) {
    try {
        localStorage.setItem(STORAGE_KEYS.SPK_PROMISES, JSON.stringify(promises));
    } catch (error) {
        console.error('Error saving SPK promises:', error);
    }
}

export function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.SPK_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.SPK_PROMISES);
}
