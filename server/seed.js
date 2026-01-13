const { pool } = require('./db');
require('dotenv').config();

const createTables = async () => {
    const connection = await pool.getConnection();

    try {
        console.log('🔧 Creating tables...\n');

        // Create SPV table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS spv (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "spv" created');

        // Create SPK Records table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS spk_records (
                id VARCHAR(50) PRIMARY KEY,
                spk_no VARCHAR(50) NOT NULL UNIQUE,
                spv_name VARCHAR(100),
                sales_name VARCHAR(100),
                cust_name VARCHAR(200) NOT NULL,
                wa_no VARCHAR(20),
                alt_phone VARCHAR(20),
                unit_type VARCHAR(100),
                color VARCHAR(100),
                unit_year INT,
                unit_qty INT DEFAULT 1,
                payment_method VARCHAR(20),
                estimated_delivery_date DATE,
                estimated_delivery_time VARCHAR(10),
                stnk_type VARCHAR(20) DEFAULT 'normal',
                stnk_days INT,
                nopol_type VARCHAR(30) DEFAULT 'bebas',
                nopol_pilihan VARCHAR(20),
                given_surat_jalan BOOLEAN DEFAULT FALSE,
                spk_image LONGTEXT,
                consumer_photo LONGTEXT,
                consumer_signature LONGTEXT,
                status VARCHAR(50) DEFAULT 'PENDING_VALIDATION',
                chassis_no VARCHAR(50),
                engine_no VARCHAR(50),
                address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "spk_records" created');

        // Create SPK Promises table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS spk_promises (
                id VARCHAR(50) PRIMARY KEY,
                spk_id VARCHAR(50) NOT NULL,
                promise_text TEXT NOT NULL,
                confirmed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (spk_id) REFERENCES spk_records(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table "spk_promises" created');

        // Create Kesiapan Checklist table (optional, for saving checklist progress)
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS kesiapan_checklist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                spk_id VARCHAR(50) NOT NULL,
                checklist_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (spk_id) REFERENCES spk_records(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Table "kesiapan_checklist" created');

        // Create Users table for PIN authentication
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                pin VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Table "users" created');

        console.log('\n✅ All tables created successfully!\n');

    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

const seedData = async () => {
    const connection = await pool.getConnection();

    try {
        console.log('🌱 Seeding data...\n');

        // Clear existing data
        await connection.execute('DELETE FROM spk_promises');
        await connection.execute('DELETE FROM kesiapan_checklist');
        await connection.execute('DELETE FROM spk_records');
        await connection.execute('DELETE FROM spv');
        await connection.execute('DELETE FROM users');
        console.log('🧹 Cleared existing data');

        // Seed Users
        await connection.execute(
            'INSERT INTO users (username, pin) VALUES (?, ?)',
            ['manager', '1234']
        );
        console.log('✅ Seeded manager user (PIN: 1234)');

        // Seed SPV
        const spvList = [
            ['Ahmad', '08123456789', true],
            ['Budi', '08234567890', true],
            ['Citra', '08345678901', true],
            ['Dewi', '08456789012', true],
            ['Eko', '08567890123', true],
        ];

        for (const [name, phone, active] of spvList) {
            await connection.execute(
                'INSERT INTO spv (name, phone, active) VALUES (?, ?, ?)',
                [name, phone, active]
            );
        }
        console.log('✅ Seeded 5 SPV records');

        // Generate IDs
        const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

        // Seed SPK Records
        const now = new Date();
        const deliveryDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // H+3
        const deliveryDate2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // H+7
        const deliveryDate3 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // H+14

        const spkRecords = [
            {
                id: generateId(),
                spk_no: 'SPK-2026-001',
                spv_name: 'Ahmad',
                sales_name: 'Rizky Pratama',
                cust_name: 'Andi Wijaya',
                wa_no: '081234567890',
                alt_phone: '082123456789',
                unit_type: 'Xpander Ultimate CVT',
                color: 'Quartz White Pearl (Premium)',
                unit_year: 2026,
                unit_qty: 1,
                payment_method: 'Cash',
                estimated_delivery_date: deliveryDate1,
                estimated_delivery_time: '10:00',
                stnk_type: 'normal',
                nopol_type: 'bebas',
                given_surat_jalan: true,
                status: 'BUTUH_KONFIRMASI_KESIAPAN',
                address: 'Jl. Sudirman No. 123, Jakarta Selatan'
            },
            {
                id: generateId(),
                spk_no: 'SPK-2026-002',
                spv_name: 'Budi',
                sales_name: 'Siti Rahayu',
                cust_name: 'Bambang Susanto',
                wa_no: '085678901234',
                unit_type: 'Pajero Sport Dakar Ultimate (4x2) AT',
                color: 'Jet Black Mica',
                unit_year: 2026,
                unit_qty: 1,
                payment_method: 'Kredit',
                estimated_delivery_date: deliveryDate2,
                estimated_delivery_time: '14:00',
                stnk_type: 'percepatan',
                stnk_days: 7,
                nopol_type: 'pilno_dibantu',
                nopol_pilihan: 'B 1234 ABC',
                given_surat_jalan: false,
                status: 'PENDING_VALIDATION',
                address: 'Jl. Gatot Subroto No. 45, Jakarta Pusat'
            },
            {
                id: generateId(),
                spk_no: 'SPK-2026-003',
                spv_name: 'Citra',
                sales_name: 'Dedi Kurniawan',
                cust_name: 'Christine Angelina',
                wa_no: '087890123456',
                unit_type: 'Xforce Ultimate CVT',
                color: 'Red Metallic (Xforce)',
                unit_year: 2026,
                unit_qty: 1,
                payment_method: 'Cash',
                estimated_delivery_date: deliveryDate3,
                estimated_delivery_time: '09:00',
                stnk_type: 'normal',
                nopol_type: 'ganjil',
                given_surat_jalan: true,
                status: 'VALID',
                address: 'Jl. Raya Bogor No. 789, Depok'
            }
        ];

        for (const record of spkRecords) {
            const columns = Object.keys(record).join(', ');
            const placeholders = Object.keys(record).map(() => '?').join(', ');
            const values = Object.values(record);

            await connection.execute(
                `INSERT INTO spk_records (${columns}) VALUES (${placeholders})`,
                values
            );
        }
        console.log('✅ Seeded 3 SPK records');

        // Seed promises for first SPK
        const promiseId1 = generateId();
        const promiseId2 = generateId();
        await connection.execute(
            'INSERT INTO spk_promises (id, spk_id, promise_text, confirmed) VALUES (?, ?, ?, ?)',
            [promiseId1, spkRecords[0].id, 'Free kaca film 3M untuk semua kaca', false]
        );
        await connection.execute(
            'INSERT INTO spk_promises (id, spk_id, promise_text, confirmed) VALUES (?, ?, ?, ?)',
            [promiseId2, spkRecords[0].id, 'Service gratis 5 tahun atau 50.000 km', false]
        );

        // Seed promises for second SPK
        const promiseId3 = generateId();
        await connection.execute(
            'INSERT INTO spk_promises (id, spk_id, promise_text, confirmed) VALUES (?, ?, ?, ?)',
            [promiseId3, spkRecords[1].id, 'Asuransi comprehensive 1 tahun', false]
        );

        console.log('✅ Seeded SPK promises');

        console.log('\n🎉 Seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log('   - 5 SPV records');
        console.log('   - 3 SPK records');
        console.log('   - 3 promise records');

    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

const main = async () => {
    try {
        console.log('🚀 Starting database setup...\n');
        console.log(`📦 Database: ${process.env.DB_DATABASE}`);
        console.log(`🌐 Host: ${process.env.DB_HOST}\n`);

        await createTables();
        await seedData();

        console.log('\n✅ Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    }
};

main();
