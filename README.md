#Undersurvillance Camera Mesh

##Goal

The purpose of this project is to monitor a camera using web interface from anywhere. The quality of this is the live and minimum delay of transferring the video.

In my testing environment, The project ran on a raspberry pi2 connected to a wifi dongle and logitec camera.

##Requirements

nodejs
npm
raspberry pi with raspian linux 4.4.13-v7+
Logitec camera
Installed Wifi/Internet Access


##Install
after deploying the project from Github, run the following commands:
````
npm install

npm start
````
##Monitor

login to the running server https://[the raspberry pi dns/ip]:4330
The default username/password is admin/fffff



For more information, search google for exhesham

##Stream the video to a file
###Install:
sudo apt-get update
sudo apt-get install libav-tools
sudo apt-get install ffmpeg
### create video file:
First you need to streanm to mjpeg file
wget -O outpufilenamep.mjpg  http://127.0.0.1:777/?action=stream

and then compress it.
ffmpeg -i outfilenamep.mjpg testing.mp4






