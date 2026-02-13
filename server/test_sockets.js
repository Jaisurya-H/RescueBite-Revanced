const io = require("socket.io-client");
const http = require('http');

// Helper to make API requests
const performRequest = (path, method, data, token = null) => {
    return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (data) headers['Content-Length'] = Buffer.byteLength(data);

        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: headers,
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body || '{}') }));
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
};

const registerOrLogin = async (user) => {
    const loginRes = await performRequest('/api/auth/login', 'POST', JSON.stringify({ email: user.email, password: user.password }));
    if (loginRes.statusCode === 200) return loginRes.body.token;

    const registerRes = await performRequest('/api/auth/register', 'POST', JSON.stringify(user));
    if (registerRes.statusCode === 201) {
        const login = await performRequest('/api/auth/login', 'POST', JSON.stringify({ email: user.email, password: user.password }));
        return login.body.token;
    }
    throw new Error(`Auth failed for ${user.email}`);
};

const runTests = async () => {
    console.log("--- Setting up Socket Client ---");
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("newFood", (data) => {
        console.log("EVENT RECEIVED: newFood ->", data.message);
    });

    socket.on("foodAccepted", (data) => {
        console.log("EVENT RECEIVED: foodAccepted ->", data.message);
    });

    socket.on("foodCollected", (data) => {
        console.log("EVENT RECEIVED: foodCollected ->", data.message);
    });

    console.log("--- Setting up Users ---");
    const donorToken = await registerOrLogin({ name: "Socket Donor", email: "socket_d@test.com", password: "123", contactNumber: "1", location: "A", role: "Donor" });
    const ngoToken = await registerOrLogin({ name: "Socket NGO", email: "socket_n@test.com", password: "123", contactNumber: "2", location: "B", role: "NGO" });

    // Wait for socket connection
    await new Promise(r => setTimeout(r, 1000));

    console.log("\n--- Triggering 'newFood' Event ---");
    const foodData = JSON.stringify({ foodType: "Socket Sandwich", quantity: 1, preparationTime: new Date(), pickupLocation: "Web", description: "Real-time" });
    const createRes = await performRequest('/api/food', 'POST', foodData, donorToken);
    const foodId = createRes.body.food._id;

    await new Promise(r => setTimeout(r, 1000));

    console.log("\n--- Triggering 'foodAccepted' Event ---");
    await performRequest(`/api/food/${foodId}`, 'PUT', JSON.stringify({ action: 'accept' }), ngoToken);

    await new Promise(r => setTimeout(r, 1000));

    console.log("\n--- Triggering 'foodCollected' Event ---");
    await performRequest(`/api/food/${foodId}`, 'PUT', JSON.stringify({ action: 'collect' }), ngoToken);

    // Allow time for last event
    await new Promise(r => setTimeout(r, 2000));
    socket.disconnect();
    console.log("\nTest Complete.");
};

runTests();
