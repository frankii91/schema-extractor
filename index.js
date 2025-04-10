const express = require('express');
const app = express();

// ZAMIANA: pozwól przyjmować raw tekst
app.use(express.text({ type: '*/*' }));

app.post('/extract', async (req, res) => {
  try {
    const raw = req.body;
    const parsed = JSON.parse(raw); // <-- ręcznie parsujemy JSON
    const url = parsed.url;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Brakuje poprawnego pola "url"' });
    }

    const metadata = require('html-metadata');
    const result = await metadata(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
