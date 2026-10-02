require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// 1. Body parsing middleware for POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory URL storage
const urlDatabase = [];

// 2. POST /api/shorturl
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate URL format
  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  // freeCodeCamp requires http/https protocols
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  // Verify domain with DNS
  dns.lookup(parsedUrl.hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: 'invalid url' });
    }

    let index = urlDatabase.indexOf(originalUrl);
    if (index === -1) {
      urlDatabase.push(originalUrl);
      index = urlDatabase.length - 1;
    }

    res.json({
      original_url: originalUrl,
      short_url: index + 1
    });
  });
});

// 3. GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url, 10);
  const originalUrl = urlDatabase[shortUrl - 1];

  if (!originalUrl) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});