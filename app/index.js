const express = require('express');
const bodyParser = require('body-parser');
const microdata = require('microdata-node');
const cheerio = require('cheerio');

const app = express();
app.use(bodyParser.text({ type: '*/*' }));

function extractJSONLD(html) {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  const results = [];

  scripts.each((i, el) => {
    try {
      const content = $(el).html();
      const parsed = JSON.parse(content);
      results.push(parsed);
    } catch (e) {
      // ignore malformed JSON
    }
  });

  return results;
}

app.post('/extract', async (req, res) => {
  const html = req.body;

  try {
    const microdataResult = microdata.toJson(html);
    const jsonldResult = extractJSONLD(html);

    res.json({
      jsonld: jsonldResult,
      microdata: microdataResult.items || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Schema extractor listening on port ${port}`);
});
