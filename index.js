const express = require('express');
const bodyParser = require('body-parser');
const metadata = require('html-metadata-parser');

const app = express();
app.use(bodyParser.text({ type: '*/*' }));

app.post('/extract', async (req, res) => {
  const html = req.body;

  try {
    const result = await metadata.parseFromString(html);
    res.json({
      jsonld: result.jsonld || [],
      microdata: result.microdata || [],
      opengraph: result.opengraph || {},
      general: result.meta || {}
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Schema extractor (html-metadata) listening on port ${port}`);
});
