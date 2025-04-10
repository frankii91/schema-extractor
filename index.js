const express = require('express');
const metadata = require('html-metadata');

const app = express();
app.use(express.json());

app.post('/extract', async (req, res) => {
  const url = req.body.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Brakuje prawidłowego pola "url"' });
  }

  try {
    const result = await metadata(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Schema extractor (html-metadata) listening on port ${port}`);
});
