FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install express body-parser microdata-node cheerio

EXPOSE 8080

CMD ["node", "index.js"]
