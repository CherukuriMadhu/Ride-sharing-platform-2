const https = require('http');

const passwords = ['admin', 'admin123', 'password', '123456'];
const email = 'admin@smartride.com';

async function testPasswords() {
    for (const password of passwords) {
        const data = JSON.stringify({ email, password });
        const options = {
            hostname: 'localhost',
            port: 8082,
            path: '/api/users/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const res = await new Promise((resolve) => {
            const req = https.request(options, (res) => {
                let body = '';
                res.on('data', (d) => body += d);
                res.on('end', () => resolve({ statusCode: res.statusCode, body }));
            });
            req.write(data);
            req.end();
        });

        console.log(`Password: ${password} -> Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
            console.log('Login Success!');
            process.exit(0);
        }
    }
}

testPasswords();
