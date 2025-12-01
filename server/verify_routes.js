const { spawn } = require('child_process');
const http = require('http');

const PORT = 3001;
const serverProcess = spawn('node', ['index.js'], {
    env: { ...process.env, PORT: PORT },
    cwd: __dirname,
    stdio: 'inherit' // Pipe output so we can see server logs
});

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            console.log(`Response from ${path}: ${res.statusCode}`);
            resolve(res.statusCode);
        });

        req.on('error', (e) => {
            reject(e);
        });

        // Send empty body to trigger "URL is required" (400) if route exists
        req.write(JSON.stringify({}));
        req.end();
    });
}

// Give server time to start
setTimeout(async () => {
    try {
        console.log('Testing /api/youtube/info...');
        const status1 = await makeRequest('/api/youtube/info');

        console.log('Testing /youtube/info...');
        const status2 = await makeRequest('/youtube/info');

        let success = true;
        if (status1 === 404) {
            console.error('FAIL: /api/youtube/info returned 404');
            success = false;
        }
        if (status2 === 404) {
            console.error('FAIL: /youtube/info returned 404');
            success = false;
        }

        if (success) {
            console.log('SUCCESS: Both routes are accessible (not 404).');
        } else {
            console.error('FAIL: One or more routes returned 404.');
            process.exitCode = 1;
        }

    } catch (err) {
        console.error('Test Error:', err);
        process.exitCode = 1;
    } finally {
        serverProcess.kill();
        process.exit();
    }
}, 3000); // Wait 3 seconds for server to start
