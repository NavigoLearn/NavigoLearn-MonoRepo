#!/usr/bin/bash

# Build the project
# build the frontend
cd src/frontend || exit 1
rm -rf dist
npm i
npm run build

# if the build is successful
if [ $? -eq 1 ]; then
  echo "Build failed for the frontend"
  exit 1
fi

# run the build
cd dist/server || exit 1
screen -dmS frontend node entry.mjs

# go to the backend directory
cd ../../../api || exit 1
# build the project
rm -rf dist
npm i
npm run build

# if the build is successful
if [ $? -eq 1 ]; then
  echo "Build failed for the backend api"
  exit 1
fi

# run the build
screen -dmS api npm run start