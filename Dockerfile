FROM mcr.microsoft.com/azure-functions/node:4-node18 as base

FROM base as build
WORKDIR /app

COPY . .

RUN \
  npm ci --install-strategy nested && \
  npm run build -w server && \
  npm run build -w client && \
  mv client/dist server/static && \
  npm prune --production

FROM base
WORKDIR /app

COPY --from=build /app/server .

EXPOSE 7071
CMD [ "npm", "run", "start:ci"]
