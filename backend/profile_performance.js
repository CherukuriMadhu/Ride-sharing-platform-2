const http = require('http');

async function testPerformance(email, password) {
    const loginData = JSON.stringify({ email, password });

    const start = Date.now();

    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8082,
            path: '/api/users/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        }, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', async () => {
                const loginTime = Date.now() - start;
                console.log(`Login Time for ${email}: ${loginTime}ms`);

                if (res.statusCode === 200) {
                    const data = JSON.parse(body);
                    const token = data.token;
                    const userId = data.user.id;

                    // Now test analytics
                    const analyticStart = Date.now();
                    const analyticReq = http.request({
                        hostname: 'localhost',
                        port: 8082,
                        path: `/api/analytics/driver/${userId}`,
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }, (aRes) => {
                        let aBody = '';
                        aRes.on('data', (d) => aBody += d);
                        aRes.on('end', () => {
                            const analyticTime = Date.now() - analyticStart;
                            console.log(`Driver Analytics Time: ${analyticTime}ms`);
                            resolve();
                        });
                    });
                    analyticReq.end();
                } else {
                    console.log('Login failed', res.statusCode);
                    resolve();
                }
            });
        });
        req.write(loginData);
        req.end();
    });
}

testPerformance('driver@test.com', '123456');
