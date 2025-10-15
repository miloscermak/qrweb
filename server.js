const express = require('express');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const dataDir = path.join(__dirname, 'data');

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

ensureDataDir();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/publish', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const id = nanoid(10);
    const pageUrl = `${req.protocol}://${req.get('host')}/p/${id}`;
    
    const pageData = {
      id,
      text,
      createdAt: new Date().toISOString(),
      url: pageUrl
    };

    await fs.writeFile(
      path.join(dataDir, `${id}.json`),
      JSON.stringify(pageData, null, 2)
    );

    res.json({
      success: true,
      url: pageUrl,
      id
    });
  } catch (error) {
    console.error('Error publishing text:', error);
    res.status(500).json({ error: 'Failed to publish text' });
  }
});

app.get('/p/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dataFile = path.join(dataDir, `${id}.json`);
    
    const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
    const pageUrl = `${req.protocol}://${req.get('host')}/p/${id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(pageUrl);

    const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Publikovaný text</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .qr-container {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    .qr-container img {
      max-width: 256px;
      height: auto;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      font-size: 16px;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="qr-container">
    <h2>QR kód této stránky</h2>
    <img src="${qrCodeDataUrl}" alt="QR kód">
    <p>URL: <a href="${pageUrl}">${pageUrl}</a></p>
  </div>
  
  <div class="content">
    ${escapeHtml(data.text)}
  </div>
  
  <div class="meta">
    Publikováno: ${new Date(data.createdAt).toLocaleString('cs-CZ')}
  </div>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Error loading page:', error);
    res.status(404).send('Stránka nenalezena');
  }
});

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});