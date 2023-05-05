#!/usr/bin/bash


# Build the project
# go to the backend directory
cd src/api || exit 1
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

# build the frontend
cd ../frontend || exit 1
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