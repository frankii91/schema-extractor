import express from 'express';
import * as cheerio from 'cheerio';
import * as scrape from 'html-metadata';

const app = express();
app.use(express.text({ type: '*/*' }));

app.post('/extract', async (req, res) => {
  console.log('--- ŻĄDANIE ODEBRANE ---');
  console.log('Typ danych:', req.headers['content-type']);
  console.log('Ciało żądania:', req.body);

  let body;
  try {
    const parsed = JSON.parse(req.body);
    body = typeof parsed.body === 'object' ? parsed.body : parsed;
  } catch {
    return res.status(400).json({ error: 'Niepoprawny JSON lub struktura' });
  }

  const url = body?.url;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    console.warn('❗ Niepoprawne lub brakujące pole "url":', url);
    return res.status(400).json({ error: 'Brakuje poprawnego pola "url"' });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
  
  try {
    console.log('🌐 Pobieram stronę:', url);
     const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await response.text();

    console.log('📄 Długość HTML:', html.length);
    const $ = cheerio.load(html);

    console.log('🔍 Parsuję metadane...');
    const [parseAll] = await Promise.all([
      scrape.parseAll($).catch(() => null)
    ]);

    console.log('✅ Parsowanie zakończone pomyślnie!');
    res.json([{
      json: {
        success: true,
        data: parseAll
      }
    }]);
  } catch (err) {
    console.error('❌ Błąd podczas przetwarzania:', err);
    clearTimeout(timeout);

    let errorType = 'UnknownError';
    let message = err.message || String(err);
  
    if (err.name === 'AbortError') {
      errorType = 'TimeoutError';
      message = 'Serwer nie odpowiedział w ustalonym czasie.';
    } else if (message.includes('ENOTFOUND')) {
      errorType = 'DNSNotFound';
    } else if (err.name === 'FetchError') {
      errorType = 'FetchError';
    } else if (message.includes('invalid url')) {
      errorType = 'InvalidUrl';
    } else if (message.includes('ECONNREFUSED')) {
      errorType = 'NetworkError';
    }
    
  
    res.json([{
      json: {
        success: false,
        error: errorType,
        message,
        url
      }
    }]);
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Serwis metadata-parser działa na porcie ${port}`);
});
