#!/bin/bash
webserver_prcces_num=$(ps aux | grep "server.js" |grep -v grep | wc -l)
if (( $webserver_prcces_num == 0 )); then
	echo "web server ftw is not running...starting it."	
	cd /home/pi/UnderSurvillance/src
	nohup node "/home/pi/UnderSurvillance/src/server.js" &
fi
