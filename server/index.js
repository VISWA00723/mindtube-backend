/***************************************************************
 * MindTube Backend - Production Optimized
 * Platform: Linux (Render / Vercel / Railway)
 ***************************************************************/

const express = require("express");
const cors = require("cors");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

/***************************************************************
 * 1. CORS CONFIG (🔥 DO NOT USE "*")
 ***************************************************************/
const allowedOrigins = [
    "https://mindtub.netlify.app",   // your production frontend
    "http://localhost:5173"         // dev frontend
];

app.use(
    cors({
        origin: function (origin, cb) {
            if (!origin || allowedOrigins.includes(origin)) {
                return cb(null, true);
            }
            return cb(new Error("CORS Blocked: " + origin));
        },
        credentials: false,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.use(express.json());

/***************************************************************
 * 2. yt-dlp Binary (Linux, NOT .exe)
 ***************************************************************/
const YT_DLP_PATH = path.join(
    __dirname,
    "node_modules",
    "ytdlp-nodejs",
    "bin",
    "yt-dlp"
);

/***************************************************************
 * Utility: Execute yt-dlp and return JSON
 ***************************************************************/
const runYtDlpJson = (url) => {
    return new Promise((resolve, reject) => {
        const process = spawn(YT_DLP_PATH, ["-J", url]);

        let output = "";
        let errors = "";

        process.stdout.on("data", (d) => (output += d.toString()));
        process.stderr.on("data", (d) => (errors += d.toString()));

        process.on("close", (code) => {
            if (code !== 0) {
                return reject(
                    new Error(`yt-dlp failed (code ${code}): ${errors}`)
                );
            }
            try {
                return resolve(JSON.parse(output));
            } catch (e) {
                return reject(new Error("Invalid yt-dlp JSON: " + e.message));
            }
        });
    });
};

/***************************************************************
 * 3. ROUTES
 ***************************************************************/

/**
 * Health Check
 */
app.get("/", (req, res) => {
    res.json({ status: "OK", app: "MindTube Backend" });
});

/***********************
 * YouTube Info
 ***********************/
app.post("/api/youtube/info", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return res.status(400).json({ error: "URL is required" });

        const info = await runYtDlpJson(url);

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats: info.formats?.filter(
                (f) => f.ext === "mp4" || f.ext === "m4a"
            ),
        });
    } catch (err) {
        console.error("[YT INFO ERROR]", err.message);
        res.status(500).json({
            error: "Failed to fetch video info",
            details: err.message,
        });
    }
});

/***********************
 * YouTube Download
 ***********************/
app.get("/api/youtube/download", async (req, res) => {
    try {
        const { url, format } = req.query;
        if (!url)
            return res.status(400).json({ error: "URL is required" });

        const isAudio = format === "audio";

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="download.${isAudio ? "mp3" : "mp4"}"`
        );

        const args = [
            url,
            "-f",
            isAudio ? "bestaudio" : "best",
            "-o",
            "-",
        ];

        const process = spawn(YT_DLP_PATH, args);

        process.stdout.pipe(res);

        process.stderr.on("data", (d) =>
            console.warn("[yt-dlp]", d.toString())
        );

        process.on("close", (code) => {
            if (code !== 0) {
                console.error("[DOWNLOAD ERROR] yt-dlp exit", code);
            }
        });
    } catch (err) {
        console.error("[DOWNLOAD ERROR]", err.message);
        if (!res.headersSent)
            res.status(500).json({ error: "Download failed" });
    }
});

/***********************
 * Instagram Info
 ***********************/
app.post("/api/instagram/info", async (req, res) => {
    try {
        const { url } = req.body;
        if (!url)
            return res.status(400).json({ error: "URL is required" });

        const info = await runYtDlpJson(url);

        let mediaUrl = info.url;
        if (!mediaUrl && info.formats?.length > 0) {
            mediaUrl = info.formats.at(-1).url;
        }

        res.json({
            title: info.title || "Instagram Media",
            thumbnail: info.thumbnail,
            media_url: mediaUrl,
            url_list: [mediaUrl],
        });
    } catch (err) {
        console.error("[IG INFO ERROR]", err.message);
        res.status(500).json({
            error: "Failed to fetch Instagram info",
            details: err.message,
        });
    }
});

/***************************************************************
 * 4. START SERVER
 ***************************************************************/
app.listen(PORT, () => {
    console.log(`🔥 MindTube backend running on port: ${PORT}`);
});
