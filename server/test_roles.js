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
        name: "Donor Dave",
        email: "donor@test.com",
        password: "123456",
        contactNumber: "1234567890",
        location: "City",
        role: "Donor"
    };

    const ngoUser = {
        name: "NGO Nancy",
        email: "ngo@test.com",
        password: "123456",
        contactNumber: "0987654321",
        location: "City",
        role: "NGO"
    };

    const donorToken = await registerOrLogin(donorUser);
    console.log('Donor Token obtained.');

    const ngoToken = await registerOrLogin(ngoUser);
    console.log('NGO Token obtained.');

    console.log('\n--- SCENARIO 1: Login as Donor ---');

    const foodData = JSON.stringify({
        foodType: "Pizza",
        quantity: 5,
        preparationTime: "2026-02-14T12:00:00Z",
        pickupLocation: "Downtown",
        description: "Hot pizza"
    });

    console.log('1.1. Create food (Should ✅ Work)');
    let foodId;
    const createResDonor = await performRequest('/api/food', 'POST', foodData, donorToken);
    console.log(`Status: ${createResDonor.statusCode} (Expected 201)`);
    if (createResDonor.statusCode === 201) {
        foodId = createResDonor.body.food._id;
        console.log('Food Created ID:', foodId);
    } else {
        console.log('Error:', createResDonor.body);
    }

    console.log('1.2. Accept food (Should ❌ Fail - 403)');
    if (foodId) {
        const acceptResDonor = await performRequest(`/api/food/${foodId}`, 'PUT', null, donorToken);
        console.log(`Status: ${acceptResDonor.statusCode} (Expected 403)`);
        console.log('Message:', acceptResDonor.body.message);
    }

    console.log('\n--- SCENARIO 2: Login as NGO ---');

    console.log('2.1. Create food (Should ❌ Fail - 403)');
    const createResNGO = await performRequest('/api/food', 'POST', foodData, ngoToken);
    console.log(`Status: ${createResNGO.statusCode} (Expected 403)`);
    console.log('Message:', createResNGO.body.message);

    console.log('2.2. Accept food (Should ✅ Work)');
    if (foodId) {
        const acceptResNGO = await performRequest(`/api/food/${foodId}`, 'PUT', null, ngoToken);
        console.log(`Status: ${acceptResNGO.statusCode} (Expected 200)`);
        console.log('Message:', acceptResNGO.body.message);
        console.log('New Status:', acceptResNGO.body.food?.status);
    }
};

runTests();
