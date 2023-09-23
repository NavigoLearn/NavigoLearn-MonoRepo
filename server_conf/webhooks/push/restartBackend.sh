#!/bin/bash

branch_name="prod"

change_dir_and_check() {
   cd "$1" || {
      echo "Could not change to directory $1. Exiting...";
      exit 1;
   }
}
# update environment variables
change_dir_and_check src/api/env
git reset --hard && git checkout $branch_name && git pull origin $branch_name

# Start the backend
change_dir_and_check ../
git reset --hard && git checkout $branch_name && git pull origin $branch_name
npm install && npm run build || exit 1

# kill existing backend screen sessions
screen -ls | awk '/\.api/ {print strtonum($1)}' | while read session_id; do screen -S "${session_id}" -X quit; done

# Remove the cache
sudo rm -rf /var/cache/nginx/backend/*

# Start the backend
screen -dmS api npm run start