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

    throw new Error(`Could not auth user: ${user.email}`);
};

const runTests = async () => {
    console.log('--- Setting up Users ---');

    const donorUser = {
        name: "Lifecycle Donor",
        email: "life_donor@test.com",
        password: "123456",
        contactNumber: "1231231234",
        location: "City",
        role: "Donor"
    };

    const ngoUser = {
        name: "Lifecycle NGO",
        email: "life_ngo@test.com",
        password: "123456",
        contactNumber: "3213214321",
        location: "City",
        role: "NGO"
    };

    const donorToken = await registerOrLogin(donorUser);
    const ngoToken = await registerOrLogin(ngoUser);
    console.log('Tokens obtained.');

    console.log('\n--- 1. Donor Creates Food ---');
    const foodData = JSON.stringify({
        foodType: "Sandwich",
        quantity: 15,
        preparationTime: "2026-02-14T16:00:00Z",
        pickupLocation: "Park",
        description: "Veg sandwiches"
    });

    let foodId;
    const createRes = await performRequest('/api/food', 'POST', foodData, donorToken);
    if (createRes.statusCode === 201) {
        foodId = createRes.body.food._id;
        console.log('Food Created. ID:', foodId);
    } else {
        console.log('Failed to create food:', createRes.body);
        return;
    }

    console.log('\n--- 2. NGO Tries to Collect (Invalid Order) ---');
    const invalidCollectRes = await performRequest(`/api/food/${foodId}`, 'PUT', JSON.stringify({ action: 'collect' }), ngoToken);
    console.log(`Status: ${invalidCollectRes.statusCode} (Expected 400)`);
    console.log('Message:', invalidCollectRes.body.message);

    console.log('\n--- 3. NGO Accepts Food ---');
    const acceptRes = await performRequest(`/api/food/${foodId}`, 'PUT', JSON.stringify({ action: 'accept' }), ngoToken);
    console.log(`Status: ${acceptRes.statusCode} (Expected 200)`);
    console.log('Message:', acceptRes.body.message);

    console.log('\n--- 4. NGO Tries to Accept Again (Invalid) ---');
    const invalidAcceptRes = await performRequest(`/api/food/${foodId}`, 'PUT', JSON.stringify({ action: 'accept' }), ngoToken);
    console.log(`Status: ${invalidAcceptRes.statusCode} (Expected 400)`);
    console.log('Message:', invalidAcceptRes.body.message);

    console.log('\n--- 5. NGO Collects Food ---');
    const collectRes = await performRequest(`/api/food/${foodId}`, 'PUT', JSON.stringify({ action: 'collect' }), ngoToken);
    console.log(`Status: ${collectRes.statusCode} (Expected 200)`);
    console.log('Message:', collectRes.body.message);

    console.log('\n--- 6. Verify Notifications ---');
    const donorNotifs = await performRequest('/api/notifications', 'GET', null, donorToken);
    console.log('Donor Notifications:', donorNotifs.body.map(n => n.message));
};

runTests();
