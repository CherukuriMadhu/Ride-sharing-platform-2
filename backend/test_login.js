const https = require('http');

const data = JSON.stringify({
    email: 'admin@smartride.com',
    password: 'admin123'
});

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

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
