const mysql = require('mysql2/promise');
async function queryDb() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '5972',
        database: 'smartride'
    });
    const [rows] = await connection.execute('SELECT * FROM reviews');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}
queryDb().catch(console.error);
