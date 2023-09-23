#!/bin/bash

npm install --install-strategy=nested
npm run build --prefix server

npm run build -w client
mv client/dist server/static

npm run publish -w server
