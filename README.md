# Undersurvillance Camera Mesh

## Goal

The purpose of this project is to monitor a camera using web interface from anywhere. The quality of this is the live and minimum delay of transferring the video.

In my testing environment, The project ran on a raspberry pi2 connected to a wifi dongle and logitec camera.

## Requirements

* Raspberry Pie
* Raspian
* up to 4 webcams - The project is tested on Logitec.

### Prerequisites

Expected `nodejs` and `npm` installed on your raspian.

In order to install nodejs from the node source, run the next commands:
```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
```


## Install

The npm install will run the installation script under `Server/scripts`.

```
npm install
```


### Start

after deploying the project from Github and installing the project, run the following commands:
````
npm start
````

## Monitor

login to the running server https://[the raspberry pi dns/ip]:4330
The default username/password is admin/admin

The username and password are located in the config file. the password is md5 hashed.

For more information, go to exhesham.com.


