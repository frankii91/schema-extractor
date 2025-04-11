FROM node:23-alpine

WORKDIR /app

# tylko skrypty startowe, reszta z GitHuba
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
