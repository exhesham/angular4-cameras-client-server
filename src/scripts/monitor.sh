#!/bin/bash
webserver_prcces_num=$(ps aux | grep "USRMainServer.js" |grep -v grep | wc -l)
if (( $webserver_prcces_num == 0 )); then
	echo "web server ftw is not running...starting it."
	nohup node "/home/pi/UnderSurvillance/src/USRMainServer.js" &
fi
