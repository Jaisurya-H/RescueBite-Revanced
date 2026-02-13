const http = require('http');

const performRequest = (path, method, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: JSON.parse(responseBody),
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.write(data);
        req.end();
    });
};

const runTests = async () => {
    console.log('--- Testing Registration ---');
    const registerData = JSON.stringify({
        name: "Surya",
        email: "surya@test.com",
        password: "123456",
        contactNumber: "9876543210",
        location: "Coimbatore",
        role: "Donor"
    });

    try {
        const registerResponse = await performRequest('/api/auth/register', 'POST', registerData);
        console.log('Status:', registerResponse.statusCode);
        console.log('Body:', JSON.stringify(registerResponse.body, null, 2));
    } catch (error) {
        console.error('Register Error:', error.message);
    }

    console.log('\n--- Testing Login ---');
    const loginData = JSON.stringify({
        email: "surya@test.com",
        password: "123456"
    });

    try {
        const loginResponse = await performRequest('/api/auth/login', 'POST', loginData);
        console.log('Status:', loginResponse.statusCode);
        console.log('Body:', JSON.stringify(loginResponse.body, null, 2));
    } catch (error) {
        console.error('Login Error:', error.message);
    }
};

runTests();
