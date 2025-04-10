const express = require('express');
const metadata = require('html-metadata');

const app = express();

// Obsługa obu formatów: JSON oraz tekstu (dla n8n streamów)
app.use(express.json({ type: 'application/json' }));
app.use(express.text({ type: ['text/*', '*/*'] }));

app.post('/extract', async (req, res) => {
  console.log('--- Żądanie odebrane ---');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('BODY RAW:', req.body);

  let url;

  try {
    if (typeof req.body === 'string') {
      // Body jako string - parsujemy JSON ręcznie
      const parsed = JSON.parse(req.body);
      url = parsed.url;
    } else if (typeof req.body === 'object' && req.body.url) {
      // Body jako obiekt JSON
      url = req.body.url;
    }

    if (!url || typeof url !== 'string') {
      console.warn('⚠️ Brakuje poprawnego pola "url"');
      return res.status(400).json({ error: 'Brakuje poprawnego pola "url"' });
    }

    console.log('➡️ Pobieranie danych z URL:', url);
    const result = await metadata(url);
    console.log('✅ Sukces! Metadane zwrócone.');
    res.json(result);

  } catch (err) {
    console.error('❌ Błąd przetwarzania:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Schema extractor (html-metadata) działa na porcie ${port}`);
});
