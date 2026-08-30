const https = require('http');

// First login as admin
const loginData = JSON.stringify({
    email: 'admin@smartride.com',
    password: 'admin123'
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
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
        const response = JSON.parse(body);
        const token = response.token;

        // Fetch user id for driver@test.com
        const usersOptions = {
            hostname: 'localhost',
            port: 8082,
            path: '/api/admin/users',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        };

        const usersReq = https.request(usersOptions, (uRes) => {
            let uBody = '';
            uRes.on('data', (d) => { uBody += d; });
            uRes.on('end', () => {
                const users = JSON.parse(uBody);
                const driver = users.find(u => u.email === 'driver@test.com');
                console.log('Driver status:', driver.status);

                if (driver.status === 'BANNED' || driver.status === 'INACTIVE') {
                    // Update user status
                    const updateOptions = {
                        hostname: 'localhost',
                        port: 8082,
                        path: `/api/admin/users/${driver.id}/approve`,
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    };

                    const updateReq = https.request(updateOptions, (upRes) => {
                        console.log('Status updated:', upRes.statusCode);
                    });
                    updateReq.end();
                } else {
                    console.log('User is already approved active.');
                }
            });
        });
        usersReq.end();
    });
});

req.on('error', console.error);
req.write(loginData);
req.end();
