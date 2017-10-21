# Undersurvillance Camera Mesh

## Goal

The purpose of this project is to monitor a camera using web interface from anywhere. The quality of this is the live and minimum delay of transferring the video.

In my testing environment, The project ran on a raspberry pi2 connected to a wifi dongle and logitec camera.

## Requirements



## Install

### Prerequisites

The server uses the npm `v4l2camera` which require g++ version bigger than 4.9 and also nodejs v4.x.
In order to install nodejs from the node source, run the next commands:
```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs

```

It is recommended to update the raspian by running `sudo apt-get update`

### Start

after deploying the project from Github, run the following commands:
````
npm install

npm start
````

## Monitor

login to the running server https://[the raspberry pi dns/ip]:4330
The default username/password is admin/fffff



For more information, search google for exhesham

## Stream the video to a file

### Install:
sudo apt-get update
sudo apt-get install libav-tools
sudo apt-get install ffmpeg

### Create video file:
First you need to streanm to mjpeg file
wget -O outpufilenamep.mjpg  http://127.0.0.1:777/?action=stream

and then compress it.
ffmpeg -i outfilenamep.mjpg testing.mp4






