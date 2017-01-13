#!/bin/bash
SRC_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/../"

function clear(){
	rm -rf /root/.forever/USR.log
	rm -rf /root/.forever/USRMainServer.log
	rm -rf /home/pi/UnderSurvillance/logs/*
	forever stopall

}
function start(){
	netstat -tlpn | grep 4330
	if [ ! $? -eq 0 ]; then
		forever start $SRC_DIR/USRMainServer.js -l $SRC_DIR -o $SRC_DIR -e $SRC_DIR -p $SRC_DIR
	fi
}
