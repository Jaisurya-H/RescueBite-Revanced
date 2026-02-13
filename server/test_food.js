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

const runTests = async () => {
    console.log('--- 1. Login to get Token ---');
    const loginData = JSON.stringify({
        email: "surya@test.com",
        password: "123456"
    });

    let token;
    try {
        const loginResponse = await performRequest('/api/auth/login', 'POST', loginData);
        if (loginResponse.statusCode === 200) {
            token = loginResponse.body.token;
            console.log('Login Successful. Token received.');
        } else {
            console.error('Login Failed:', loginResponse.body);
            return;
        }
    } catch (error) {
        console.error('Login Error:', error.message);
        return;
    }

    console.log('\n--- 2. Create Food Listing ---');
    const foodData = JSON.stringify({
        foodType: "Rice",
        quantity: 20,
        preparationTime: "2026-02-14T10:00:00Z",
        pickupLocation: "Coimbatore",
        description: "Freshly cooked"
    });

    let foodId;
    try {
        const createResponse = await performRequest('/api/food', 'POST', foodData, token);
        console.log('Status:', createResponse.statusCode);
        console.log('Body:', JSON.stringify(createResponse.body, null, 2));
        if (createResponse.statusCode === 201) {
            foodId = createResponse.body.food._id;
        }
    } catch (error) {
        console.error('Create Food Error:', error.message);
    }

    console.log('\n--- 3. Get All Foods ---');
    try {
        const getResponse = await performRequest('/api/food', 'GET', null, token);
        console.log('Status:', getResponse.statusCode);
        console.log('Foods Count:', getResponse.body.length);
        // console.log('Body:', JSON.stringify(getResponse.body, null, 2));
    } catch (error) {
        console.error('Get Foods Error:', error.message);
    }

    if (foodId) {
        console.log(`\n--- 4. Update Food Status (Accepting Food ID: ${foodId}) ---`);
        try {
            const updateResponse = await performRequest(`/api/food/${foodId}`, 'PUT', null, token);
            console.log('Status:', updateResponse.statusCode);
            console.log('Body:', JSON.stringify(updateResponse.body, null, 2));
        } catch (error) {
            console.error('Update Food Error:', error.message);
        }
    }
};

runTests();
