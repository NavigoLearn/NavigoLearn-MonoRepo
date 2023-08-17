# Navigo Learn - MonoRepo
This is the repo for the NavigoLearn project. It contains the following projects:
  - [Navigo-Frontend](https://github.com/Navigolearn/Navigo-FrontEnd)
  - [API](https://github.com/NavigoLearn/API)
  - Glue (in this repo)

This repository is used purely to run the app locally and to call the update hook for CI/CD.

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
git clone --recurse-submodules git@github.com:NavigoLearn/NavigoLearn-MonoRepo.git
cd NavigoLearn-MonoRepo
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
