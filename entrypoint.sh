#!/bin/sh

# katalog tymczasowy
TMP_DIR=/tmp/code

# czyść poprzednią kopię
rm -rf "$TMP_DIR"

# klonuj repo do TMP_DIR
git clone --depth=1 https://github.com/frankii91/schema-extractor.git "$TMP_DIR"

# skopiuj zawartość do /app (nadpisz pliki, zachowaj inne)
cp -r "$TMP_DIR"/* /app/

cd /app
npm install
npm cache clean --force
rm -rf /tmp/code

node index.js
