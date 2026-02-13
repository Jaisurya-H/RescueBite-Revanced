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
    console.log('--- Setting up Users ---');

    const donorUser = {
        name: "Notif Donor",
        email: "notif_donor@test.com",
        password: "123456",
        contactNumber: "1111111111",
        location: "City",
        role: "Donor"
    };

    const ngoUser = {
        name: "Notif NGO",
        email: "notif_ngo@test.com",
        password: "123456",
        contactNumber: "2222222222",
        location: "City",
        role: "NGO"
    };

    const donorToken = await registerOrLogin(donorUser);
    console.log('Donor Token obtained.');

    const ngoToken = await registerOrLogin(ngoUser);
    console.log('NGO Token obtained.');

    console.log('\n--- 1. Donor Creates Food ---');
    const foodData = JSON.stringify({
        foodType: "Burger",
        quantity: 10,
        preparationTime: "2026-02-14T14:00:00Z",
        pickupLocation: "Mall",
        description: "Tasty burgers"
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

    console.log('\n--- 2. Check NGO Notifications (Should see new food alert) ---');
    const ngoNotifs = await performRequest('/api/notifications', 'GET', null, ngoToken);
    console.log(`Status: ${ngoNotifs.statusCode}`);
    console.log('Latest Notification:', ngoNotifs.body[0]?.message);

    if (foodId) {
        console.log('\n--- 3. NGO Accepts Food ---');
        const acceptRes = await performRequest(`/api/food/${foodId}`, 'PUT', null, ngoToken);
        console.log(`Status: ${acceptRes.statusCode}`);

        console.log('\n--- 4. Check Donor Notifications (Should see acceptance alert) ---');
        const donorNotifs = await performRequest('/api/notifications', 'GET', null, donorToken);
        console.log(`Status: ${donorNotifs.statusCode}`);
        console.log('Latest Notification:', donorNotifs.body[0]?.message);

        if (donorNotifs.body.length > 0) {
            const notifId = donorNotifs.body[0]._id;
            console.log(`\n--- 5. Mark Notification as Read (ID: ${notifId}) ---`);
            const readRes = await performRequest(`/api/notifications/${notifId}`, 'PUT', null, donorToken);
            console.log(`Status: ${readRes.statusCode}`);
            console.log('Message:', readRes.body.message);
        }
    }
};

runTests();
