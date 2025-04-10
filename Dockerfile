FROM node:23-alpine

WORKDIR /app

# kopiujemy pliki: index.js i package.json
COPY . .

# instalujemy wszystko z package.json
RUN npm install

EXPOSE 8080

CMD ["node", "index.js"]
