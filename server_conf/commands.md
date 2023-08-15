# screen -dmS hooks /usr/bin/webhook -hooks /home/(user)/NavigoLearn-MonoRepo/server_conf/webhooks/hooks.json -ip "0.0.0.0" -verbose
This is the command to run the webhook server. It is run in a screen session so that it can be detached from the terminal and left running. 
The webhook server is used to trigger a rebuild of the server when a push is made to the repository. The webhook server is run on port 9000.

# screen -dmS server /home/(user)/NavigoLearn-MonoRepo/run.sh
This is the command to run the server. It is run in a screen session so that it can be detached from the terminal and left running.
