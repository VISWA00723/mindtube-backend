const axios = require('axios');

async function testBackend() {
    const BASE_URL = 'http://localhost:3000/api';
    console.log('Testing Backend at', BASE_URL);

    // Test YouTube Info
    try {
        console.log('Testing YouTube Info...');
        const ytRes = await axios.post(`${BASE_URL}/youtube/info`, {
            url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' // Me at the zoo
        });
        console.log('✅ YouTube Info Success:', ytRes.status);
    } catch (error) {
        console.error('❌ YouTube Info Failed:', error.response ? error.response.status : error.message);
    }

    // Test Instagram Info (might fail if lib is unstable, but check 404 vs 500)
    try {
        console.log('Testing Instagram Info...');
        const igRes = await axios.post(`${BASE_URL}/instagram/info`, {
            url: 'https://www.instagram.com/p/C-uMQv8p_Q0/' // Random post
        });
        console.log('✅ Instagram Info Success:', igRes.status);
    } catch (error) {
        console.error('❌ Instagram Info Failed:', error.response ? error.response.status : error.message);
    }
}

testBackend();
