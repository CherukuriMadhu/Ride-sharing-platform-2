const mysql = require('mysql2/promise');

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '5972',
        database: 'smartride'
    });

    console.log('Connected to MySQL.');

    const queries = [
        // Payments table
        `CREATE TABLE IF NOT EXISTS payments (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            payment_id VARCHAR(255),
            order_id VARCHAR(255),
            passenger_id BIGINT,
            ride_id BIGINT,
            driver_id BIGINT,
            booking_id BIGINT,
            seats INT,
            price_per_seat DOUBLE,
            total_amount DOUBLE,
            platform_commission DOUBLE,
            driver_earnings DOUBLE,
            payment_method VARCHAR(255),
            status VARCHAR(50),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        // Add columns if they don't exist
        {
            table: 'rides',
            column: 'total_seats',
            query: 'ALTER TABLE rides ADD COLUMN total_seats INT NOT NULL DEFAULT 0'
        },
        {
            table: 'bookings',
            column: 'transaction_id',
            query: 'ALTER TABLE bookings ADD COLUMN transaction_id VARCHAR(255)'
        },
        {
            table: 'bookings',
            column: 'payment_status',
            query: "ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'PENDING'"
        },
        {
            table: 'bookings',
            column: 'payment_date',
            query: "ALTER TABLE bookings ADD COLUMN payment_date DATETIME"
        },
        {
            table: 'bookings',
            column: 'amount',
            query: "ALTER TABLE bookings ADD COLUMN amount DOUBLE DEFAULT 0.0"
        },
        {
            table: 'bookings',
            column: 'currency',
            query: "ALTER TABLE bookings ADD COLUMN currency VARCHAR(10) DEFAULT 'INR'"
        },
        {
            table: 'bookings',
            column: 'base_fare',
            query: 'ALTER TABLE bookings ADD COLUMN base_fare DOUBLE DEFAULT 0.0'
        },
        // Indices
        "CREATE INDEX idx_transaction_id ON bookings(transaction_id)"
    ];

    for (let item of queries) {
        try {
            if (typeof item === 'string') {
                await connection.query(item);
                console.log(`Success: ${item.substring(0, 50)}...`);
            } else {
                // Check if column exists
                const [rows] = await connection.query(
                    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'smartride' AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
                    [item.table, item.column]
                );

                if (rows.length === 0) {
                    await connection.query(item.query);
                    console.log(`Added column ${item.column} to ${item.table}`);
                } else {
                    console.log(`Column ${item.column} already exists in ${item.table}`);
                }
            }
        } catch (err) {
            console.warn(`Warning/Error executing query: ${err.message}`);
        }
    }

    await connection.end();
    console.log('Database schema update complete.');
}

updateSchema();
