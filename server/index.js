const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to yt-dlp binary
const YT_DLP_PATH = path.join(__dirname, 'node_modules', 'ytdlp-nodejs', 'bin', 'yt-dlp.exe');

// Logging setup
const logStream = fs.createWriteStream(path.join(__dirname, 'server_debug.log'), { flags: 'a' });
function logToFile(msg) {
    const timestamp = new Date().toISOString();
    logStream.write(`[${timestamp}] ${msg}\n`);
}
const originalConsoleError = console.error;
console.error = (...args) => {
    const msg = args.map(a => (a instanceof Error ? a.stack : a)).join(' ');
    logToFile('ERROR: ' + msg);
    originalConsoleError.apply(console, args);
};
const originalConsoleLog = console.log;
console.log = (...args) => {
    const msg = args.join(' ');
    logToFile('INFO: ' + msg);
    originalConsoleLog.apply(console, args);
};

const CLIENT_URL = process.env.CLIENT_URL || '*';
app.use(cors({
    origin: CLIENT_URL
}));
app.use(express.json());

// Helper to run yt-dlp and get JSON
const getYtDlpJson = (url) => {
    return new Promise((resolve, reject) => {
        const process = spawn(YT_DLP_PATH, ['-J', url]);
        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
            } else {
                try {
                    resolve(JSON.parse(stdout));
                } catch (e) {
                    reject(new Error(`Failed to parse JSON: ${e.message}`));
                }
            }
        });
    });
};

// YouTube Info Handler
const handleYoutubeInfo = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        console.log('Fetching YouTube info for:', url);
        const info = await getYtDlpJson(url);

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats: info.formats.filter(f => f.ext === 'mp4' || f.ext === 'm4a')
        });
    } catch (error) {
        console.error('YouTube Info Error:', error);
        res.status(500).json({ error: 'Failed to fetch video info', details: error.message });
    }
};

// YouTube Info Endpoints
app.post('/api/youtube/info', handleYoutubeInfo);
app.post('/youtube/info', handleYoutubeInfo);

// YouTube Download Endpoint
app.get('/api/youtube/download', async (req, res) => {
    try {
        const { url, format } = req.query;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        const isAudio = format === 'audio';
        res.header('Content-Disposition', `attachment; filename="download.${isAudio ? 'mp3' : 'mp4'}"`);

        const args = [
            url,
            '-f', isAudio ? 'bestaudio' : 'best',
            '-o', '-'
        ];

        const process = spawn(YT_DLP_PATH, args);

        process.stdout.pipe(res);

        process.stderr.on('data', (data) => {
            console.error('yt-dlp stderr:', data.toString());
        });

        process.on('close', (code) => {
            if (code !== 0) {
                console.error(`yt-dlp exited with code ${code}`);
            }
        });

    } catch (error) {
        console.error('YouTube Download Error:', error);
        if (!res.headersSent) res.status(500).json({ error: 'Download failed' });
    }
});

// Instagram Info Endpoint (Using yt-dlp)
app.post('/api/instagram/info', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'URL is required' });

        console.log('Fetching Instagram info for:', url);
        const info = await getYtDlpJson(url);

        // yt-dlp returns different structure for Instagram
        // It usually returns a single entry or a playlist
        // We need to extract the direct URL

        let mediaUrl = info.url;
        if (!mediaUrl && info.formats) {
            // Try to find best format
            const best = info.formats[info.formats.length - 1];
            mediaUrl = best.url;
        }

        res.json({
            title: info.title || 'Instagram Media',
            thumbnail: info.thumbnail,
            media_url: mediaUrl,
            url_list: [mediaUrl] // Compatible with frontend
        });
    } catch (error) {
        console.error('Instagram Info Error:', error);
        res.status(500).json({ error: 'Failed to fetch Instagram info', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
