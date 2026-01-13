import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const SPKContext = createContext();

export function useSPK() {
    return useContext(SPKContext);
}

export function SPKProvider({ children }) {
    const [spkRecords, setSpkRecords] = useState([]);
    const [spkPromises, setSpkPromises] = useState([]);
    const [currentSPK, setCurrentSPK] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load data from API on mount
    const refreshData = useCallback(async () => {
        try {
            setLoading(true);
            const records = await api.fetchSPKRecords();
            setSpkRecords(records);

            // Load all promises
            const allPromises = [];
            for (const record of records) {
                const promises = await api.fetchPromisesBySPKId(record.id);
                allPromises.push(...promises);
            }
            setSpkPromises(allPromises);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Check H-5 delivery alerts on load and update status
    useEffect(() => {
        const checkAlerts = async () => {
            if (loading || spkRecords.length === 0) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let hasUpdates = false;

            for (const record of spkRecords) {
                if (record.status !== 'VALID') continue;
                if (!record.estimatedDeliveryDate) continue;

                const deliveryDate = new Date(record.estimatedDeliveryDate);
                deliveryDate.setHours(0, 0, 0, 0);

                const diffTime = deliveryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 5 && diffDays >= 0) {
                    try {
                        await api.updateSPKRecord(record.id, {
                            status: 'BUTUH_KONFIRMASI_KESIAPAN',
                        });
                        hasUpdates = true;
                    } catch (error) {
                        console.error('Error updating status:', error);
                    }
                }
            }

            if (hasUpdates) {
                refreshData();
            }
        };

        checkAlerts();
    }, [loading, spkRecords.length]);

    // Generate unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Check if SPK number already exists
    const isSPKNumberUnique = async (spkNo, excludeId = null) => {
        try {
            return await api.checkSPKNumberUnique(spkNo, excludeId);
        } catch (error) {
            console.error('Error checking SPK number:', error);
            return true;
        }
    };

    // Get records with alerts (H-5 or less)
    const getAlertRecords = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return spkRecords.filter(record => {
            if (!record.estimatedDeliveryDate) return false;
            const deliveryDate = new Date(record.estimatedDeliveryDate);
            deliveryDate.setHours(0, 0, 0, 0);
            const diffTime = deliveryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 5 && diffDays >= 0;
        });
    };

    // Create new SPK
    const createSPK = async (data) => {
        try {
            const result = await api.createSPKRecord(data);
            await refreshData();
            return result.id;
        } catch (error) {
            console.error('Error creating SPK:', error);
            throw error;
        }
    };

    // Update SPK record
    const updateSPK = async (id, updates) => {
        try {
            await api.updateSPKRecord(id, updates);
            setSpkRecords(prev =>
                prev.map(r => r.id === id ? { ...r, ...updates } : r)
            );
        } catch (error) {
            console.error('Error updating SPK:', error);
            throw error;
        }
    };

    // Delete SPK record
    const deleteSPK = async (id) => {
        try {
            await api.deleteSPKRecord(id);
            setSpkRecords(prev => prev.filter(r => r.id !== id));
            setSpkPromises(prev => prev.filter(p => p.spkId !== id));
        } catch (error) {
            console.error('Error deleting SPK:', error);
            throw error;
        }
    };

    // Get SPK by ID
    const getSPKById = (id) => {
        return spkRecords.find(r => r.id === id);
    };

    // Get promises for SPK
    const getPromisesBySPKId = (spkId) => {
        return spkPromises.filter(p => p.spkId === spkId);
    };

    // Update promise confirmation
    const confirmPromise = async (promiseId, confirmed) => {
        try {
            await api.confirmPromise(promiseId, confirmed);
            setSpkPromises(prev =>
                prev.map(p => p.id === promiseId ? { ...p, confirmed } : p)
            );
        } catch (error) {
            console.error('Error confirming promise:', error);
            throw error;
        }
    };

    // Update all promises for an SPK (for edit)
    const updatePromises = async (spkId, newPromises) => {
        try {
            await api.updatePromisesForSPK(spkId, newPromises);
            // Refresh promises
            const updatedPromises = await api.fetchPromisesBySPKId(spkId);
            setSpkPromises(prev => [
                ...prev.filter(p => p.spkId !== spkId),
                ...updatedPromises
            ]);
        } catch (error) {
            console.error('Error updating promises:', error);
            throw error;
        }
    };

    // Submit SPK (after consumer signs)
    const submitSPK = async (id, signature) => {
        await updateSPK(id, {
            status: 'SUBMITTED',
            consumerSignature: signature,
        });
    };

    // Manager approves SPK
    const approveSPK = async (id) => {
        await updateSPK(id, {
            status: 'VALID',
        });
    };

    // Manager rejects SPK
    const rejectSPK = async (id, reason) => {
        await updateSPK(id, {
            status: 'REJECTED',
            rejectReason: reason,
        });
    };

    // Confirm kesiapan (after checklist confirmed)
    const confirmKesiapan = async (id, checklistData) => {
        await updateSPK(id, {
            status: 'SIAP_KIRIM',
            kesiapanConfirmedAt: new Date().toISOString(),
        });
    };

    // Match PDI data
    const matchPDI = async (id, chassisNo, engineNo) => {
        await updateSPK(id, {
            status: 'PDI_MATCHED',
            chassisNo,
            engineNo,
        });
    };

    // Update surat jalan
    const updateSuratJalan = async (id, data) => {
        await updateSPK(id, data);
    };

    // Get records by status
    const getRecordsByStatus = (status) => {
        return spkRecords.filter(r => r.status === status);
    };

    // Get stats
    const getStats = () => {
        return {
            total: spkRecords.length,
            pending: spkRecords.filter(r => r.status === 'PENDING_VALIDATION').length,
            submitted: spkRecords.filter(r => r.status === 'SUBMITTED').length,
            valid: spkRecords.filter(r => r.status === 'VALID').length,
            butuhKonfirmasiKesiapan: spkRecords.filter(r => r.status === 'BUTUH_KONFIRMASI_KESIAPAN').length,
            siapKirim: spkRecords.filter(r => r.status === 'SIAP_KIRIM').length,
            pdiMatched: spkRecords.filter(r => r.status === 'PDI_MATCHED').length,
        };
    };

    const value = {
        spkRecords,
        spkPromises,
        currentSPK,
        setCurrentSPK,
        loading,
        refreshData,
        isSPKNumberUnique,
        createSPK,
        updateSPK,
        getSPKById,
        getPromisesBySPKId,
        confirmPromise,
        updatePromises,
        submitSPK,
        approveSPK,
        rejectSPK,
        confirmKesiapan,
        matchPDI,
        updateSuratJalan,
        getRecordsByStatus,
        getStats,
        getAlertRecords,
        deleteSPK,
    };

    return (
        <SPKContext.Provider value={value}>
            {children}
        </SPKContext.Provider>
    );
}
