const express = require('express');
const got = require('got');
const cheerio = require('cheerio');
const { parseDublinCore, parseOpenGraph, parseMicrodata } = require('html-metadata');

const app = express();

app.use(express.json({ type: 'application/json' }));
app.use(express.text({ type: ['text/*', '*/*'] }));

app.post('/extract', async (req, res) => {
  console.log('--- Żądanie odebrane ---');
  console.log('Body:', req.body);

  let url = null;

  try {
    if (typeof req.body === 'string') {
      const parsed = JSON.parse(req.body);
      url = parsed.url;
    } else if (typeof req.body === 'object') {
      url = req.body.url;
    }

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('❗ Niepoprawny URL:', url);
      return res.status(400).json({ error: 'Brakuje poprawnego pola "url"' });
    }

    console.log('➡️ Pobieranie HTML z:', url);
    const response = await got(url);
    const $ = cheerio.load(response.body);

    console.log('🔍 Parsowanie metadanych...');
    const [dc, og, micro] = await Promise.all([
      parseDublinCore($),
      parseOpenGraph($),
      parseMicrodata($)
    ]);

    res.json({
      dublinCore: dc,
      opengraph: og,
      microdata: micro
    });

  } catch (err) {
    console.error('❌ Błąd:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Mikroserwis metadata-parser działa na porcie ${port}`);
});
