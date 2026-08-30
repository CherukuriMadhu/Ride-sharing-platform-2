const mysql = require('mysql2/promise');

async function updateDatabase() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '5972',
    database: 'smartride'
  });

  try {
    console.log('Adding indexes to notifications table...');
    
    // Index for faster fetching by userId
    await connection.execute('CREATE INDEX idx_notifications_user_id ON notifications(user_id)');
    
    // Index for faster sorting by createdAt
    await connection.execute('CREATE INDEX idx_notifications_created_at ON notifications(created_at)');
    
    // Index for unread notifications count
    await connection.execute('CREATE INDEX idx_notifications_user_is_read ON notifications(user_id, is_read)');

    console.log('Indexes added successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_KEYNAME') {
      console.log('Indexes already exist.');
    } else {
      console.error('Error updating database:', error);
    }
  } finally {
    await connection.end();
  }
}

updateDatabase();
