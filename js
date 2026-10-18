// server.js
const express   = require('express');
const multer    = require('multer');
const { google }= require('googleapis');
const cors      = require('cors');
const path      = require('path');
const fs        = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// ----------  Multer (file upload temp) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({ storage });

// ----------  Google OAuth2 client ----------
const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',      // ganti dengan Client ID Anda
  'YOUR_CLIENT_SECRET',  // ganti dengan Client Secret Anda
  'http://localhost:3000/oauth2callback' // redirect URI
);

// 1. Endpoint: /oauth2callback (redirect setelah login)
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // Simpan token di session atau database (simpel: cookie)
  res.send('Login berhasil! Anda bisa kembali ke aplikasi.');
});

// 2. Endpoint: Upload file ke Drive
app.post('/api/upload-to-drive', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file' });

  try {
    // Membuat instance Drive API
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Upload file
    const fileMetadata = {
      name: req.file.originalname,
      parents: ['root'] // atau folder tertentu
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id,webViewLink,webContentLink'
    });

    // Hapus file sementara
    fs.unlinkSync(req.file.path);

    // Return data ke front‑end
    res.json({
      success: true,
      id: response.data.id,
      viewLink: response.data.webViewLink,
      downloadLink: response.data.webContentLink
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload gagal' });
  }
});

// ----------  Start server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
