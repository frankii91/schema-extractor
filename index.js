const express = require('express');
const metadata = require('html-metadata');

const app = express();
app.use(express.text({ type: '*/*' }));

app.post('/extract', async (req, res) => {
  console.log('--- Żądanie odebrane ---');
  console.log('RAW BODY:', req.body);

  try {
    const parsed = JSON.parse(req.body);
    const url = parsed.url;

    if (!url || typeof url !== 'string') {
      console.warn('❗ Niepoprawny URL:', url);
      return res.status(400).json({ error: 'Brakuje poprawnego pola "url"' });
    }

    console.log('➡️ Pobieranie metadanych z URL:', url);
    const result = await metadata(url);
    console.log('✅ Metadane pobrane');

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
