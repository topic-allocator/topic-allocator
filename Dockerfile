FROM mcr.microsoft.com/azure-functions/node:4-node18 as base

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
  AzureFunctionsJobHost__Logging__Console__IsEnabled=true \
  FUNCTIONS_WORKER_RUNTIME=node \
  AzureWebJobsFeatureFlags=EnableWorkerIndexing

FROM base as build

COPY . .

RUN \
  npm ci --install-strategy nested && \
  npm run build -w server && \
  npm run build -w client && \
  mv client/dist server/static && \
  npm prune --production 

FROM base
WORKDIR /home/site/wwwroot

COPY --from=build server .

RUN apt-get update
RUN apt-get install -y python3 python3-pip
RUN pip install -r src/solver/requirements.txt
