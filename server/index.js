const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===================
// SPV Routes
// ===================

// Get all SPV
app.get('/api/spv', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM spv ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active SPV only
app.get('/api/spv/active', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM spv WHERE active = TRUE ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create SPV
app.post('/api/spv', async (req, res) => {
    try {
        const { name, active = true } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO spv (name, active) VALUES (?, ?)',
            [name, active]
        );
        res.json({ id: result.insertId, name, active });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update SPV
app.put('/api/spv/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, active } = req.body;
        await pool.execute(
            'UPDATE spv SET name = ?, active = ? WHERE id = ?',
            [name, active, id]
        );
        res.json({ id, name, active });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete SPV
app.delete('/api/spv/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM spv WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================
// SPK Records Routes
// ===================

// Get all SPK records
app.get('/api/spk', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM spk_records ORDER BY created_at DESC'
        );
        // Convert snake_case to camelCase
        const records = rows.map(row => ({
            id: row.id,
            spkNo: row.spk_no,
            spvName: row.spv_name,
            salesName: row.sales_name,
            custName: row.cust_name,
            waNo: row.wa_no,
            altPhone: row.alt_phone,
            unitType: row.unit_type,
            color: row.color,
            unitYear: row.unit_year,
            unitQty: row.unit_qty,
            paymentMethod: row.payment_method,
            estimatedDeliveryDate: row.estimated_delivery_date,
            estimatedDeliveryTime: row.estimated_delivery_time,
            stnkType: row.stnk_type,
            stnkDays: row.stnk_days,
            nopolType: row.nopol_type,
            nopolPilihan: row.nopol_pilihan,
            givenSuratJalan: row.given_surat_jalan,
            spkImage: row.spk_image,
            consumerPhoto: row.consumer_photo,
            consumerSignature: row.consumer_signature,
            status: row.status,
            chassisNo: row.chassis_no,
            engineNo: row.engine_no,
            address: row.address,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get SPK by ID
app.get('/api/spk/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM spk_records WHERE id = ?',
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'SPK not found' });
        }
        const row = rows[0];
        res.json({
            id: row.id,
            spkNo: row.spk_no,
            spvName: row.spv_name,
            salesName: row.sales_name,
            custName: row.cust_name,
            waNo: row.wa_no,
            altPhone: row.alt_phone,
            unitType: row.unit_type,
            color: row.color,
            unitYear: row.unit_year,
            unitQty: row.unit_qty,
            paymentMethod: row.payment_method,
            estimatedDeliveryDate: row.estimated_delivery_date,
            estimatedDeliveryTime: row.estimated_delivery_time,
            stnkType: row.stnk_type,
            stnkDays: row.stnk_days,
            nopolType: row.nopol_type,
            nopolPilihan: row.nopol_pilihan,
            givenSuratJalan: row.given_surat_jalan,
            spkImage: row.spk_image,
            consumerPhoto: row.consumer_photo,
            consumerSignature: row.consumer_signature,
            status: row.status,
            chassisNo: row.chassis_no,
            engineNo: row.engine_no,
            address: row.address,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check SPK number uniqueness
app.get('/api/spk/check-spk-no/:spkNo', async (req, res) => {
    try {
        const { spkNo } = req.params;
        const excludeId = req.query.excludeId;

        let query = 'SELECT id FROM spk_records WHERE spk_no = ?';
        let params = [spkNo];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const [rows] = await pool.execute(query, params);
        res.json({ isUnique: rows.length === 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create SPK
app.post('/api/spk', async (req, res) => {
    try {
        const data = req.body;
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

        await pool.execute(`
            INSERT INTO spk_records (
                id, spk_no, spv_name, sales_name, cust_name, wa_no, alt_phone,
                unit_type, color, unit_year, unit_qty, payment_method,
                estimated_delivery_date, estimated_delivery_time,
                stnk_type, stnk_days, nopol_type, nopol_pilihan,
                given_surat_jalan, spk_image, consumer_photo, status, address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            data.spkNo,
            data.spvName,
            data.salesName,
            data.custName,
            data.waNo,
            data.altPhone,
            data.unitType,
            data.color,
            data.unitYear,
            data.unitQty,
            data.paymentMethod,
            data.estimatedDeliveryDate,
            data.estimatedDeliveryTime,
            data.stnkType,
            data.stnkDays || null,
            data.nopolType,
            data.nopolPilihan,
            data.givenSuratJalan,
            data.spkImage,
            data.consumerPhoto,
            'PENDING_VALIDATION',
            data.address || ''
        ]);

        // Create promises
        if (data.promises && data.promises.length > 0) {
            for (const promise of data.promises) {
                const promiseId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                await pool.execute(
                    'INSERT INTO spk_promises (id, spk_id, promise_text) VALUES (?, ?, ?)',
                    [promiseId, id, promise.text]
                );
            }
        }

        res.json({ id, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update SPK
app.put('/api/spk/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updates = [];
        const values = [];

        const fieldMap = {
            spkNo: 'spk_no',
            spvName: 'spv_name',
            salesName: 'sales_name',
            custName: 'cust_name',
            waNo: 'wa_no',
            altPhone: 'alt_phone',
            unitType: 'unit_type',
            color: 'color',
            unitYear: 'unit_year',
            unitQty: 'unit_qty',
            paymentMethod: 'payment_method',
            estimatedDeliveryDate: 'estimated_delivery_date',
            estimatedDeliveryTime: 'estimated_delivery_time',
            stnkType: 'stnk_type',
            stnkDays: 'stnk_days',
            nopolType: 'nopol_type',
            nopolPilihan: 'nopol_pilihan',
            givenSuratJalan: 'given_surat_jalan',
            spkImage: 'spk_image',
            consumerPhoto: 'consumer_photo',
            consumerSignature: 'consumer_signature',
            status: 'status',
            chassisNo: 'chassis_no',
            engineNo: 'engine_no',
            address: 'address',
        };

        for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
            if (data[camelKey] !== undefined) {
                updates.push(`${snakeKey} = ?`);
                values.push(data[camelKey]);
            }
        }

        if (updates.length > 0) {
            values.push(id);
            await pool.execute(
                `UPDATE spk_records SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================
// Promises Routes
// ===================

// Get promises by SPK ID
app.get('/api/promises/:spkId', async (req, res) => {
    try {
        const { spkId } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM spk_promises WHERE spk_id = ? ORDER BY created_at',
            [spkId]
        );
        const promises = rows.map(row => ({
            id: row.id,
            spkId: row.spk_id,
            promiseText: row.promise_text,
            confirmed: row.confirmed,
            createdAt: row.created_at,
        }));
        res.json(promises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update promise confirmation
app.put('/api/promises/:id/confirm', async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmed } = req.body;
        await pool.execute(
            'UPDATE spk_promises SET confirmed = ? WHERE id = ?',
            [confirmed, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update all promises for SPK
app.put('/api/promises/spk/:spkId', async (req, res) => {
    try {
        const { spkId } = req.params;
        const { promises } = req.body;

        // Delete existing promises
        await pool.execute('DELETE FROM spk_promises WHERE spk_id = ?', [spkId]);

        // Insert new promises
        for (const promise of promises) {
            const promiseId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            await pool.execute(
                'INSERT INTO spk_promises (id, spk_id, promise_text, confirmed) VALUES (?, ?, ?, ?)',
                [promiseId, spkId, promise.text, false]
            );
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ===================
// Stats Routes
// ===================

app.get('/api/stats', async (req, res) => {
    try {
        const [pending] = await pool.execute(
            "SELECT COUNT(*) as count FROM spk_records WHERE status = 'PENDING_VALIDATION'"
        );
        const [valid] = await pool.execute(
            "SELECT COUNT(*) as count FROM spk_records WHERE status = 'VALID'"
        );
        const [submitted] = await pool.execute(
            "SELECT COUNT(*) as count FROM spk_records WHERE status = 'SUBMITTED'"
        );
        const [butuhKonfirmasi] = await pool.execute(
            "SELECT COUNT(*) as count FROM spk_records WHERE status = 'BUTUH_KONFIRMASI_KESIAPAN'"
        );
        const [siapKirim] = await pool.execute(
            "SELECT COUNT(*) as count FROM spk_records WHERE status = 'SIAP_KIRIM'"
        );
        const [pdiMatched] = await pool.execute(
            "SELECT COUNT(*) as count FROM spk_records WHERE status = 'PDI_MATCHED'"
        );

        res.json({
            pending: pending[0].count,
            valid: valid[0].count,
            submitted: submitted[0].count,
            butuhKonfirmasiKesiapan: butuhKonfirmasi[0].count,
            siapKirim: siapKirim[0].count,
            pdiMatched: pdiMatched[0].count,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', async (req, res) => {
    const dbConnected = await testConnection();
    res.json({
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api\n`);
    await testConnection();
});
