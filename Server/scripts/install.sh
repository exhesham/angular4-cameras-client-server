#!/bin/bash
CURR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
function validate(){
	if [ $? -eq 0 ]; then
		return;
	fi
	echo "failed to install..."
	exit 1
}
function install_mjpg_streamer(){
	echo "Will install mjpg streamer...."
	mjpg_streamer --version
	if [ $? -eq 0 ]; then
		echo "mjpg_streamer is already installed...nothing to do!"
		exit 0
	fi 
	echo "update os"
	sudo apt-get update -y
	validate
	echo "create path"
	sudo mkdir -p /opt/mjpg_streamer
	validate
	cd /opt/mjpg_streamer
	validate
	echo "download package"
	if [ ! -e mjpg-streamer.tar.gz ]; then
		sudo rm -f mjpg-streamer.tar.gz
	fi
	sudo wget http://lilnetwork.com/download/raspberrypi/mjpg-streamer.tar.gz
	validate
	echo "untar package"
	sudo tar xvzf mjpg-streamer.tar.gz
	validate
	echo "install libjpeg8-dev"
	sudo apt-get install libjpeg8-dev -y
	validate
	echo "install imagemagick"
	sudo apt-get install imagemagick -y
	validate
	
	cd mjpg-streamer/mjpg-streamer
	validate
	sudo make
	validate
	echo "installed mjpg_streamer successfully"

}

function pupiolate_package(){

	EXPORT_PATH='export PATH=$PATH:/opt/mjpg_streamer/mjpg-streamer/mjpg-streamer/'
	EXPORT_LDPATH='export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/mjpg_streamer/mjpg-streamer/mjpg-streamer/'
	cat ~/.bashrc  | grep "$EXPORT_PATH"
	if [ ! $? -eq 0 ]; then
		echo $EXPORT_PATH >> ~/.bashrc
		echo $EXPORT_LDPATH >> ~/.bashrc
		source ~/.bashrc
	fi
}

function add_script_permissions(){
	chmod u+x $CURR_DIR/*
}
function restart_shell(){
	source ~/.bashrc
}
install_mjpg_streamer
pupiolate_package
add_script_permissions
restart_shell

#./mjpg_streamer -i "./input_uvc.so" -o "./output_http.so -w ./www"