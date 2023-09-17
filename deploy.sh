#!/bin/bash

npm run build -w client
mv client/dist client/static
rm -rf server/static
mv client/static server

echo "Client succesfully built and moved to 'server/static'"

rm -rf .temp
mkdir .temp

cp -r server .temp
rm -rf .temp/server/dist .temp/server/node_modules

npm install --prefix .temp/server
npm run generate --prefix .temp/server
npm run build --prefix .temp/server

npm run publish --prefix .temp/server
rm -rf .temp
