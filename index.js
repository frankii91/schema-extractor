import express from 'express';
import * as cheerio from 'cheerio';
import { parseDublinCore, parseOpenGraph, parseMicrodata } from 'html-metadata';

const app = express();
app.use(express.text({ type: '*/*' }));

app.post('/extract', async (req, res) => {
  console.log('--- ŻĄDANIE ODEBRANE ---');
  console.log('Typ danych:', req.headers['content-type']);
  console.log('Ciało żądania:', req.body);

  let body;
  try {
    const parsed = JSON.parse(req.body);
    body = parsed.body;
  } catch {
    return res.status(400).json({ error: 'Niepoprawny JSON lub struktura' });
  }

  const url = body?.url;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    console.warn('❗ Niepoprawne lub brakujące pole "url":', url);
    return res.status(400).json({ error: 'Brakuje poprawnego pola "url"' });
  }

  try {
    console.log('🌐 Pobieram stronę:', url);
    const response = await fetch(url);
    const html = await response.text();

    console.log('📄 Długość HTML:', html.length);
    const $ = cheerio.load(html);

    console.log('🔍 Parsuję metadane...');
    const [dc, og, micro] = await Promise.all([
      parseDublinCore($),
      parseOpenGraph($),
      parseMicrodata($)
    ]);

    console.log('✅ Parsowanie zakończone pomyślnie!');
    res.json({ dublinCore: dc, opengraph: og, microdata: micro });
  } catch (err) {
    console.error('❌ Błąd podczas przetwarzania:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Serwis metadata-parser działa na porcie ${port}`);
});
