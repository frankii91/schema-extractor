#!/bin/sh

# pobierz kod z GitHuba
git clone --depth=1 https://github.com/frankii91/schema-extractor.git /app

cd /app
npm install
node index.js
