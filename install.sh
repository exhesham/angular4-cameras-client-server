#!/bin/bash

# this script will install the client and the server
function install_client(){
	cd ./Client
	npm install
	npm run build
	cd ..
}

function install_server(){
	cd ./Server
	sudo apt-get install dos2unix
	dos2unix ./scripts/*
	chmod +x ./scripts/*
	npm install
	cd ..
}

install_client
install_server