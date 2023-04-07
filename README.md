# Navigo Learn - MonoRepo
This is the mono repo for the Navigo Learn project. It contains the following projects:
  - [Navigo-Frontend](https://github.com/Navigolearn/Navigo-FrontEnd)
  - [API](https://github.com/NavigoLearn/API)
  - Glue (this repo)

## Glue
This is the glue between the frontend and the API. 
It is a simple nodejs server that serves the 
frontend and backend via a proxy so they're on the same port.

## Requirements
  - Git
  - NodeJS
  - NPM
  - MariaDB

## How to run
```bash
git clone --recurse-submodules git@github.com:NavigoLearn/Navigo-FrontEnd.git
cd Navigo-FrontEnd
npm install
npm run dev
# and connect to http://localhost:8080 in browser
```

## How to update
```bash
git pull
npm install
npm run dev
```

## Update submodules
### This should be done by the CI when a new commit is pushed to the submodules
```bash
git submodule update --remote
```