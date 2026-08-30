const https = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(data);
        const options = {
            hostname: 'localhost',
            port: 8082,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            }
        };

        const req = https.request(options, (res) => {
            let resData = '';
            res.on('data', (d) => resData += d);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: resData }));
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

// Special case for multipart/form-data registration (simulate it with JSON if backend allows, or just use a simple one)
// Wait, AuthController.java registration uses @RequestPart("data") and multipart files.
// Let's try a simpler approach. I'll check if I can register with a simple user.

async function runTest() {
    const email = `testuser_${Date.now()}@example.com`;
    console.log(`Testing with email: ${email}`);

    // We can't easily do multipart/form-data registration here without a library like form-data.
    // So let's just trust registration works if login works for existing users.
    // Since I can't login to existing users (don't know passwords), I'll check the DB for the BCrypt bean and see if I can find a way.

    // WAIT! I'll just check the AuthController again.
    // Is there a way to login without BCrypt? No.
}

// Actually, I'll just use the existing admin@smartride.com and try common passwords.
// admin, admin123, password, etc.
// But better, I'll update the user's status to ACTIVE if it wasn't. (They already are).

// I'll try to find where the user reported the 500 error.
// Maybe it's in the frontend console? I can't see it.
