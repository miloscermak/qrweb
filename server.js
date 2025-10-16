const express = require('express');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const path = require('path');
const { kv } = require('@vercel/kv');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Fallback to in-memory storage if KV is not available (for local development)
const useKV = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
const dataStore = new Map();

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

    // Store data
    if (useKV) {
      // Store in Vercel KV (permanent)
      await kv.set(`page:${id}`, JSON.stringify(pageData));
      // Optional: Set expiry to 1 year (31536000 seconds)
      // await kv.expire(`page:${id}`, 31536000);
    } else {
      // Store in memory for local development
      dataStore.set(id, pageData);
    }

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
    
    // Get data from storage
    let data;
    if (useKV) {
      // Get from Vercel KV
      const kvData = await kv.get(`page:${id}`);
      if (!kvData) {
        return res.status(404).send('Stránka nenalezena');
      }
      data = JSON.parse(kvData);
    } else {
      // Get from memory store
      data = dataStore.get(id);
      if (!data) {
        return res.status(404).send('Stránka nenalezena');
      }
    }
    
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
      word-wrap: break-word;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      font-size: 16px;
    }
    .content h1, .content h2, .content h3 {
      margin-top: 20px;
      margin-bottom: 10px;
    }
    .content h1 { font-size: 28px; }
    .content h2 { font-size: 24px; }
    .content h3 { font-size: 20px; }
    .content p {
      margin-bottom: 12px;
    }
    .content ul, .content ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    .content blockquote {
      border-left: 4px solid #ccc;
      margin-left: 0;
      padding-left: 16px;
      color: #666;
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
    ${data.text}
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