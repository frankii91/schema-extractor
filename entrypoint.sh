#!/bin/sh

# pobierz kod z GitHuba
git clone --depth=1 https://github.com/TWOJ_USER/TWOJE_REPO.git /app

cd /app
npm install
node index.js
