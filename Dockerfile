FROM node:23-alpine

WORKDIR /app
RUN apk add --no-cache git
# tylko skrypty startowe, reszta z GitHuba
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
