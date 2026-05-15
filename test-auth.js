const axios = require('axios');

async function testAuth() {
    try {
        console.log('Testing authentication...');
        
        // First, try to register a test user
        const registerData = {
            email: 'test@example.com',
            password: 'test123',
            name: 'Test User',
            role: 'PASSENGER'
        };
        
        console.log('Attempting to register test user...');
        try {
            const registerResponse = await axios.post('http://localhost:8082/api/users/register', registerData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Registration successful:', registerResponse.data);
        } catch (regError) {
            console.log('Registration failed (user might already exist):', regError.response?.data || regError.message);
        }
        
        // Now try to login
        console.log('Attempting login...');
        const loginResponse = await axios.post('http://localhost:8082/api/users/login', {
            email: 'test@example.com',
            password: 'test123'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Login successful!', loginResponse.data);
        
    } catch (error) {
        console.error('Authentication test failed:', error.response?.data || error.message);
    }
}

testAuth();
