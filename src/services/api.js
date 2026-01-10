const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============
// SPV API
// ============

export const fetchSPVList = async () => {
    const res = await fetch(`${API_URL}/spv`);
    if (!res.ok) throw new Error('Failed to fetch SPV list');
    return res.json();
};

export const fetchActiveSPVList = async () => {
    const res = await fetch(`${API_URL}/spv/active`);
    if (!res.ok) throw new Error('Failed to fetch active SPV list');
    return res.json();
};

export const createSPV = async (data) => {
    const res = await fetch(`${API_URL}/spv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create SPV');
    return res.json();
};

export const updateSPV = async (id, data) => {
    const res = await fetch(`${API_URL}/spv/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update SPV');
    return res.json();
};

export const deleteSPV = async (id) => {
    const res = await fetch(`${API_URL}/spv/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete SPV');
    return res.json();
};

// ============
// SPK API
// ============

export const fetchSPKRecords = async () => {
    const res = await fetch(`${API_URL}/spk`);
    if (!res.ok) throw new Error('Failed to fetch SPK records');
    return res.json();
};

export const fetchSPKById = async (id) => {
    const res = await fetch(`${API_URL}/spk/${id}`);
    if (!res.ok) throw new Error('Failed to fetch SPK');
    return res.json();
};

export const checkSPKNumberUnique = async (spkNo, excludeId = null) => {
    let url = `${API_URL}/spk/check-spk-no/${encodeURIComponent(spkNo)}`;
    if (excludeId) {
        url += `?excludeId=${excludeId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to check SPK number');
    const data = await res.json();
    return data.isUnique;
};

export const createSPKRecord = async (data) => {
    const res = await fetch(`${API_URL}/spk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create SPK');
    return res.json();
};

export const updateSPKRecord = async (id, data) => {
    const res = await fetch(`${API_URL}/spk/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update SPK');
    return res.json();
};

// ============
// Promises API
// ============

export const fetchPromisesBySPKId = async (spkId) => {
    const res = await fetch(`${API_URL}/promises/${spkId}`);
    if (!res.ok) throw new Error('Failed to fetch promises');
    return res.json();
};

export const confirmPromise = async (promiseId, confirmed) => {
    const res = await fetch(`${API_URL}/promises/${promiseId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed }),
    });
    if (!res.ok) throw new Error('Failed to confirm promise');
    return res.json();
};

export const updatePromisesForSPK = async (spkId, promises) => {
    const res = await fetch(`${API_URL}/promises/spk/${spkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promises }),
    });
    if (!res.ok) throw new Error('Failed to update promises');
    return res.json();
};

// ============
// Stats API
// ============

export const fetchStats = async () => {
    const res = await fetch(`${API_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

// ============
// Health Check
// ============

export const healthCheck = async () => {
    try {
        const res = await fetch(`${API_URL}/health`);
        return res.ok;
    } catch {
        return false;
    }
};
