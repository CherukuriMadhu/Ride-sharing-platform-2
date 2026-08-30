const https = require('http');

const loginData = JSON.stringify({
    email: 'driver@test.com',
    password: '123456'
});

const loginOptions = {
    hostname: 'localhost',
    port: 8082,
    path: '/api/users/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const req = https.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (d) => {
        body += d;
    });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Raw response body:', body);
    });
});

req.on('error', console.error);
req.write(loginData);
req.end();
