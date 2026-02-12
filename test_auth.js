const http = require('http');

function postRequest(path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function testAuth() {
    const username = 'testuser_' + Date.now();
    const password = 'verify_pass';

    console.log(`Testing with user: ${username}`);

    try {
        // 1. Register
        const regData = JSON.stringify({ username, password, favoriteTeam: 'Real Madrid CF' });
        const regRes = await postRequest('/api/register', regData);
        console.log('Register Response:', regRes);

        if (regRes.status !== 200) throw new Error('Registration failed');

        // 2. Login
        const loginData = JSON.stringify({ username, password });
        const loginRes = await postRequest('/api/login', loginData);
        console.log('Login Response:', loginRes);

        if (loginRes.status !== 200) throw new Error('Login failed');

        console.log('SUCCESS: Authentication flow verified.');
    } catch (err) {
        console.error('FAILED:', err);
    }
}

testAuth();
