#!/bin/bash

branch_name="prod"

change_dir_and_check() {
   cd "$1" || {
      echo "Could not change to directory $1. Exiting...";
      exit 1;
   }
}
# Start the frontend
change_dir_and_check src/frontend/segment-env
git reset --hard && git checkout master && git pull origin master
change_dir_and_check ..
git reset --hard && git checkout $branch_name && git pull origin $branch_name
npm install && npm run build || exit 1
change_dir_and_check dist/server

# Kill existing frontend screen sessions
screen -ls | awk '/\.frontend/ {print strtonum($1)}' | while read session_id; do screen -S "${session_id}" -X quit; done

# Remove the cache
sudo rm -rf /var/cache/nginx/frontend/*

# Start the frontend
screen -dmS frontend node entry.mjs