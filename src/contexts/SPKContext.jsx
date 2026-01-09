import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSPKRecords, saveSPKRecords, loadSPKPromises, saveSPKPromises } from '../utils/storage';

const SPKContext = createContext();

export function useSPK() {
    return useContext(SPKContext);
}

export function SPKProvider({ children }) {
    const [spkRecords, setSpkRecords] = useState([]);
    const [spkPromises, setSpkPromises] = useState([]);
    const [currentSPK, setCurrentSPK] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load data from localStorage on mount
    useEffect(() => {
        const records = loadSPKRecords();
        const promises = loadSPKPromises();
        setSpkRecords(records);
        setSpkPromises(promises);
        setLoading(false);
    }, []);

    // Save records when changed
    useEffect(() => {
        if (!loading) {
            saveSPKRecords(spkRecords);
        }
    }, [spkRecords, loading]);

    // Save promises when changed
    useEffect(() => {
        if (!loading) {
            saveSPKPromises(spkPromises);
        }
    }, [spkPromises, loading]);

    // Generate unique ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Check if SPK number already exists
    const isSPKNumberUnique = (spkNo, excludeId = null) => {
        return !spkRecords.some(r => r.spkNo === spkNo && r.id !== excludeId);
    };

    // Create new SPK record
    const createSPK = (data) => {
        const id = generateId();
        const newRecord = {
            id,
            userId: 'SALES_001', // In production, get from auth
            custName: data.custName,
            waNo: data.waNo,
            altPhone: data.altPhone || '',
            // Unit details
            unitType: data.unitType,
            color: data.color,
            unitYear: data.unitYear,
            unitQty: data.unitQty || 1,
            paymentMethod: data.paymentMethod,
            spkNo: data.spkNo,
            spkImage: data.spkImage,
            consumerPhoto: data.consumerPhoto || null, // Changed from ktpImage
            signature: null,
            estimatedDeliveryDate: data.estimatedDeliveryDate,
            estimatedDeliveryTime: data.estimatedDeliveryTime || '10:00',
            // Administration
            stnkType: data.stnkType || 'normal',
            stnkDays: data.stnkDays || '',
            nopolType: data.nopolType || 'bebas',
            nopolPilihan: data.nopolPilihan || '',
            givenSuratJalan: data.givenSuratJalan || false,
            // Status
            status: 'DRAFT', // Will become PENDING_VALIDATION after consumer signs
            validationNote: '',
            validatedAt: null,
            createdAt: new Date().toISOString(),
            chassisNo: '',
            engineNo: '',
        };

        // Add promises
        const newPromises = data.promises.map(p => ({
            id: generateId(),
            spkId: id,
            promiseText: p.text,
            confirmed: false,
        }));

        setSpkRecords(prev => [...prev, newRecord]);
        setSpkPromises(prev => [...prev, ...newPromises]);
        setCurrentSPK(newRecord);

        return id;
    };

    // Update SPK record
    const updateSPK = (id, updates) => {
        setSpkRecords(prev =>
            prev.map(r => r.id === id ? { ...r, ...updates } : r)
        );
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
    const confirmPromise = (promiseId, confirmed) => {
        setSpkPromises(prev =>
            prev.map(p => p.id === promiseId ? { ...p, confirmed } : p)
        );
    };

    // Submit SPK (after consumer signs)
    const submitSPK = (id, signature) => {
        updateSPK(id, {
            signature,
            status: 'PENDING_VALIDATION',
        });
    };

    // Manager actions
    const approveSPK = (id, note = '') => {
        updateSPK(id, {
            status: 'VALID',
            validationNote: note,
            validatedAt: new Date().toISOString(),
        });
    };

    const rejectSPK = (id, note) => {
        updateSPK(id, {
            status: 'REVISE',
            validationNote: note,
            validatedAt: new Date().toISOString(),
        });
    };

    // Update Surat Jalan data
    const updateSuratJalan = (id, chassisNo, engineNo) => {
        updateSPK(id, { chassisNo, engineNo });
    };

    // Get filtered records
    const getRecordsByStatus = (status) => {
        if (!status || status === 'ALL') return spkRecords;
        return spkRecords.filter(r => r.status === status);
    };

    // Get stats
    const getStats = () => {
        return {
            total: spkRecords.length,
            pending: spkRecords.filter(r => r.status === 'PENDING_VALIDATION').length,
            valid: spkRecords.filter(r => r.status === 'VALID').length,
            revise: spkRecords.filter(r => r.status === 'REVISE').length,
        };
    };

    const value = {
        spkRecords,
        spkPromises,
        currentSPK,
        setCurrentSPK,
        loading,
        isSPKNumberUnique,
        createSPK,
        updateSPK,
        getSPKById,
        getPromisesBySPKId,
        confirmPromise,
        submitSPK,
        approveSPK,
        rejectSPK,
        updateSuratJalan,
        getRecordsByStatus,
        getStats,
    };

    return (
        <SPKContext.Provider value={value}>
            {children}
        </SPKContext.Provider>
    );
}
