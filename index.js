const express = require('express');
const metadata = require('html-metadata');

const app = express();

// Obsługuje JSON i tekst (dla różnych formatów wysyłanych przez n8n)
app.use(express.json({ type: 'application/json' }));
app.use(express.text({ type: ['text/*', '*/*'] }));

app.post('/extract', async (req, res) => {
  console.log('--- ŻĄDANIE ODEBRANE ---');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('REQ.BODY TYPE:', typeof req.body);
  console.log('REQ.BODY:', req.body);

  let url = null;

  try {
    if (typeof req.body === 'string') {
      console.log('🔍 Parsujemy BODY jako string...');
      const parsed = JSON.parse(req.body);
      console.log('✅ JSON sparsowany:', parsed);
      url = parsed.url;
    } else if (typeof req.body === 'object') {
      console.log('🔍 Odczytujemy BODY jako obiekt JSON...');
      url = req.body.url;
    }

    console.log('📌 Wyciągnięty URL:', url);

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('❗ Błędny lub pusty URL:', url);
      return res.status(400).json({ error: 'Brakuje poprawnego pola "url"' });
    }

    console.log('🌐 Wywołujemy html-metadata dla:', url);
    const result = await metadata(url);
    console.log('✅ Metadane pobrane poprawnie!');
    res.json(result);
  } catch (err) {
    console.error('❌ BŁĄD:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Serwis schema-extractor działa na porcie ${port}`);
});
