#!/bin/bash

killall node || true

cd ~/NavigoLearn-MonoRepo/

git pull origin prod

cd src/api
git pull origin prod

cd env
git pull origin prod

cd ../../frontend
git pull origin prod

cd ../..

sudo rm -rf /var/cache/nginx/frontend/*
sudo rm -rf /var/cache/nginx/backend/*
sudo cp ./server_conf/nginx.conf /etc/nginx/nginx.conf
sudo systemctl restart nginx

./run.sh
