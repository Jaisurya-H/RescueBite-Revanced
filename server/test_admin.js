const http = require('http');

const performRequest = (path, method, data, token = null) => {
    return new Promise((resolve, reject) => {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            headers['Content-Length'] = Buffer.byteLength(data);
        }

        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: headers,
        };

        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedBody = responseBody ? JSON.parse(responseBody) : {};
                    resolve({
                        statusCode: res.statusCode,
                        body: parsedBody,
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        body: responseBody
                    });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
};

const registerOrLogin = async (user) => {
    // Try login first
    const loginRes = await performRequest('/api/auth/login', 'POST', JSON.stringify({
        email: user.email,
        password: user.password
    }));

    if (loginRes.statusCode === 200) {
        return loginRes.body.token;
    }

    // Pass role for registration
    const registerRes = await performRequest('/api/auth/register', 'POST', JSON.stringify(user));
    if (registerRes.statusCode === 201) {
        // Login after register to get token
        const loginAfterRegister = await performRequest('/api/auth/login', 'POST', JSON.stringify({
            email: user.email,
            password: user.password
        }));
        return loginAfterRegister.body.token;
    }

    throw new Error(`Could not auth user: ${user.email} - ${JSON.stringify(registerRes.body)}`);
};

const runTests = async () => {
    console.log('--- Setting up Admin User ---');

    const adminUser = {
        name: "Admin Andy",
        email: "admin@test.com",
        password: "123456",
        contactNumber: "1122334455",
        location: "HQ",
        role: "Admin"
    };

    let adminToken;
    try {
        adminToken = await registerOrLogin(adminUser);
        console.log('Admin Token obtained.');
    } catch (e) {
        console.error(e.message);
        return;
    }

    console.log('\n--- Testing Admin Dashboard ---');

    try {
        const dashboardRes = await performRequest('/api/admin/dashboard', 'GET', null, adminToken);
        console.log(`Status: ${dashboardRes.statusCode} (Expected 200)`);
        if (dashboardRes.statusCode === 200) {
            console.log('Dashboard Stats:');
            console.log(JSON.stringify(dashboardRes.body, null, 2));
        } else {
            console.log('Error:', dashboardRes.body);
        }
    } catch (error) {
        console.error('Dashboard Error:', error.message);
    }
};

runTests();
