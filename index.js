import express from 'express';
import * as cheerio from 'cheerio';
import * as scrape from 'html-metadata';
import { AbortController } from 'node-abort-controller';

const app = express();
app.use(express.text({ type: '*/*' }));

// ==============================
// 🔵 /fetch — pobieranie HTML
// ==============================
app.post('/fetch', async (req, res) => {
  console.log('--- ŻĄDANIE ODEBRANE ---');
  console.log('Typ danych:', req.headers['content-type']);
  console.log('Ciało żądania:', req.body);

  let body;
  let url;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
  
  try {
    try {
      const parsed = JSON.parse(req.body);
      body = typeof parsed.body === 'object' ? parsed.body : parsed;
    } catch {
      throw { name: 'InvalidJson', message: 'Niepoprawny JSON lub struktura' };
    }
    url = body?.url;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('❗ Niepoprawne lub brakujące pole "url":', url);
      throw { name: 'InvalidUrl', message: 'Brakuje poprawnego pola "url"', url };
    }
    
    console.log('🌐 Pobieram stronę:', url);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) {
      throw { name: 'HttpError', message: `Status ${response.status}`, url };
    }
    
    const html = await response.text();
    console.log('📄 Długość HTML:', html.length);

     res.json({
      success: true,
      html,
      url
    });
  } catch (err) {
    console.error('❌ /fetch Błąd podczas przetwarzania:', err);
    
    clearTimeout(timeout);
    
    let errorType = 'UnknownError';
    let message = err.message || String(err);
  
    if (err.name === 'AbortError') {
      errorType = 'TimeoutError';
      message = 'Serwer nie odpowiedział w ustalonym czasie.';
    } else if (err.name === 'FetchError') {
      errorType = 'FetchError';
    } else if (message.includes('ENOTFOUND')) {
      errorType = 'DNSNotFound';
    } else if (message.includes('ECONNREFUSED')) {
      errorType = 'ConnectionRefused';
    } else if (message.includes('ECONNRESET')) {
      errorType = 'ConnectionReset';
    } else if (message.includes('ETIMEDOUT')) {
      errorType = 'SocketTimeout';
    } else if (message.includes('self signed certificate')) {
      errorType = 'SSLError';
    } else if (message.includes('invalid url') || err.name === 'InvalidUrl') {
      errorType = 'InvalidUrl';
    } else if (err.name === 'HttpError') {
      errorType = 'HttpError';
    }
  
    res.json({
      success: false,
      error: errorType,
      message,
      url: err.url || url || null
    });
  }
});

// ==============================
// 🟢 /parse — scrapowanie HTML
// ==============================
app.post('/parse', async (req, res) => {
  console.log('--- ŻĄDANIE ODEBRANE ---');
  console.log('Typ danych:', req.headers['content-type']);
  console.log('Ciało żądania:', req.body);

  let body;
  let url;
 
  try {
    try {
      const parsed = JSON.parse(req.body);
      body = typeof parsed.body === 'object' ? parsed.body : parsed;
    } catch {
      throw { name: 'InvalidJson', message: 'Niepoprawny JSON lub struktura' };
    }
    url = body?.url;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('❗ Niepoprawne lub brakujące pole "url":', url);
      throw { name: 'InvalidUrl', message: 'Brakuje poprawnego pola "url"', url };
    }
    
    const html = body?.html;

    if (!html || typeof html !== 'string') {
      throw { name: 'InvalidHtml', message: 'Brakuje pola "html"' };
    }

    const $ = cheerio.load(html);

    console.log('🔍 Parsuję metadane...');
    const data = await scrape.parseAll($).catch(() => {
      throw { name: 'ParseError', message: 'Nie udało się sparsować metadanych' };
    });
 
    res.json({
      success: true,
      data,
      url
    });
  } catch (err) {
    console.error('❌ /parse Błąd podczas przetwarzania:', err);
   
    let errorType = 'UnknownError';
    let message = err.message || String(err);
  
    if (err.name === 'InvalidHtml') {
      errorType = 'InvalidHtml';
    } else if (err.name === 'ParseError') {
      errorType = 'ParseError';
    } else if (message.includes('Unexpected token')) {
      errorType = 'JsonSyntaxError';
    }
  
    res.json({
      success: false,
      error: errorType,
      message,
      url: url || null
    });
  }
});

app.post('/extract', async (req, res) => {
  console.log('--- ŻĄDANIE ODEBRANE ---');
  console.log('Typ danych:', req.headers['content-type']);
  console.log('Ciało żądania:', req.body);

  let body;
  let url
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
  
  try {
    try {
      const parsed = JSON.parse(req.body);
      body = typeof parsed.body === 'object' ? parsed.body : parsed;
    } catch {
      throw { name: 'InvalidJson', message: 'Niepoprawny JSON lub struktura' };
    }
    url = body?.url;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('❗ Niepoprawne lub brakujące pole "url":', url);
      throw { name: 'InvalidUrl', message: 'Brakuje poprawnego pola "url"', url };
    }
    console.log('🌐 Pobieram stronę:', url);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    const html = await response.text();
    console.log('📄 Długość HTML:', html.length);

    const $ = cheerio.load(html);
    console.log('🔍 Parsuję metadane...');
    const parseAll = await scrape.parseAll($).catch(() => {
      throw { name: 'ParseError', message: 'Nie udało się sparsować metadanych' };
    });

    console.log('✅ Parsowanie zakończone pomyślnie!');
    res.json([{
      json: {
        success: true,
        data: parseAll,
        url
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
  console.log(`✅ Serwis działa na porcie ${port}`);
});
