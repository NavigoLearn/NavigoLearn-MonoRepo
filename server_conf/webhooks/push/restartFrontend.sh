#!/bin/bash

# define branch name
branch_name="prod"

# Start the frontend
cd src/frontend || exit 1 # change directory to frontend folder
git checkout $branch_name # checkout to the branch
git pull origin $branch_name # pull the latest code
npm install # install the dependencies
npm run build || exit 1 # build the frontend
# Get the list of screen sessions
session_list=$(screen -ls | grep "frontend" | awk '{print $1}')
# Iterate through the sessions and kill them
for session_id in $session_list; do
    screen -X -S $session_id quit
done
screen -dmS frontend npm run start # start the frontend