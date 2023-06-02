#!/bin/bash

npm run build -w client
mv client/dist client/static
rm -rf server/static
mv client/static server

echo "Client succesfully built and moved to 'server/static'"

# npm run generate -w server
rm -rf temp
mkdir temp
cp -r server temp
npm install --prefix temp/server
npm run publish --prefix temp/server
rm -rf temp

echo "Server succesfully built and published to azure"
