const mysql = require('mysql2/promise');

async function fixNotificationTable() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '5972',
        database: 'smartride'
    });

    console.log('Connected to MySQL.');

    try {
        // 1. Create table if not exists (baseline)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                user_id BIGINT NOT NULL,
                role VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(255),
                is_read BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Notifications table checked/created.');

        // 2. Check for 'user_role' column
        const [columns] = await connection.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = 'smartride' AND TABLE_NAME = 'notifications'`
        );

        const colNames = columns.map(c => c.COLUMN_NAME);
        console.log('Current columns:', colNames.join(', '));

        if (colNames.includes('user_role')) {
            if (!colNames.includes('role')) {
                console.log('Renaming user_role to role...');
                await connection.query('ALTER TABLE notifications CHANGE COLUMN user_role role VARCHAR(255) NOT NULL');
            } else {
                console.log('Dropping redundant user_role column...');
                await connection.query('ALTER TABLE notifications DROP COLUMN user_role');
            }
        } else if (!colNames.includes('role')) {
            console.log('Adding missing role column...');
            await connection.query('ALTER TABLE notifications ADD COLUMN role VARCHAR(255) NOT NULL');
        }

        console.log('Schema repair complete.');
    } catch (err) {
        console.error('Error during repair:', err);
    } finally {
        await connection.end();
    }
}

fixNotificationTable();
