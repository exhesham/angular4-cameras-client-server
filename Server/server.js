/**
 * Created by hesham on 7/2/2016.
 */

/*Imports*/
var tcpPortUsed = require('tcp-port-used');
var request = require('request');
var https = require('https');
var account = require(__dirname + '/accounts');
var process = require('process');
var fs = require('fs');
var ini = require('ini');
var bodyParser = require('body-parser');
var express = require('express');
var path = require("path");

/*Internal Imports*/
var utils = require(__dirname + '/utils.js');

/*configurations*/
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))
console.log(config.server.logs)
/*logger*/
var logger = require('bunyan').createLogger({
    name: 'USR', streams: [
        {stream: process.stdout, level: 'info'},
        {path: config.server.logs, level: 'info'}
    ]
});

// web platform
var app = express();
/// Include the express body parser parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

// bootstraping point
app.use(express.static('../Client/public'));
app.use(bodyParser.json());

//https key and certificate
var options = {
    cert: fs.readFileSync(config.server.cert_path),
    key: fs.readFileSync(config.server.cert_key_path),
    host: '0.0.0.0'
};

/*****************************************************************************************************************/
var availableCameras = {};
/*****************************************************************************************************************/
/*
 Servlet Name: login
 Request Type: POST
 Body:JSON with the next keys:
 {"username":"","password":""}
 */
app.post('/login', function (req, res) {
    logger.info("Login... The request content is:", req.body);
    var requestContent = req.body;
    if (requestContent == undefined || requestContent == null) {
        logger.info("received no data at all");
        sendStatusCode(res, 401);
        return;
    }
    if (requestContent.username == undefined || requestContent.password == undefined) {
        logger.info("didnt receive the login data");
        sendStatusCode(res, 401);
        return;

    }

    var password = requestContent.password;
    var username = requestContent.username.toLowerCase();

    logger.info("received the password: ********* and the username:" + username);
    // check in the db if the credintials are valid:
    account.ValidateLoginCredintials(password, username).then(function (token) {
        res.writeHead(200, {'Set-Cookie': [['session=' + token], ['username=' + username]]});
        res.end("OK");
        logger.info("Login Success");

    }).catch(function (err) {
        sendStatusCode(res, 401, err);
    });
});
/*****************************************************************************************************************/
/*
 Servlet Name: /cameras/stream/live
 Request Type: POST
 Body:JSON with the next keys:
 {'cameraName':''}
 */
app.all('/cameras/stream/live', function (req, res) {
    logger.info("streamvideo called:");
    var cameraindex = req.param("cameraindex");

    logger.info("will forward to " + "http://127.0.0.1:777" + cameraindex + "/?action=stream")
    account.isAuthorized(req, "admin")
        .then(function (data) {
            if (availableCameras[cameraindex] == true) {
                tcpPortUsed.check(44201, '127.0.0.1')
                    .then(function (inUse) {
                        logger.info('Port 44201 usage: ' + inUse);
                        if (inUse) {
                            var streamreq = request({url: "http://127.0.0.1:777" + cameraindex + "/?action=stream"})
                            streamreq.pipe(res).on('finish', function () {
                                streamreq.end();
                            });
                        } else {
                            logger.info("open port again");
                            utils.loadCamera(cameraindex, function () {
                                var streamreq = request({url: "http://127.0.0.1:777" + cameraindex + "/?action=stream"})
                                streamreq.pipe(res).on('finish', function () {
                                    streamreq.end();
                                })
                            });
                        }
                    }, function (err) {
                        logger.error('Error on check:', err);
                        var streamreq = request({url: "http://127.0.0.1:777" + cameraindex + "/?action=stream"})
                        streamreq.pipe(res).on('finish', function () {
                            streamreq.end();
                        })
                    });
            } else {
                logger.info("They camera does not exist. redirecting: ", __dirname + "/images/nocamera.jpg")
                utils.getFile(__dirname + "/WebClient/images/nocamera.jpg", res, "image/jpg");
            }
        })
        .catch(function (err) {
            sendStatusCode(res, 401, err);
        });
});
/*****************************************************************************************************************/
/*
 Servlet Name: /cameras/list
 Request Type: GET
 */
app.all('/cameras/list', function (req, res) {
    account.isAuthorized(req, "admin")
        .then(function (data) {
            return ["Cam1", "Cam2", "Cam3", "Cam4"];
        })
        .catch(function (err) {
            return [];
        });
});
/*****************************************************************************************************************/
// request(options, function (error, response, body) {
//     if (error) throw new Error(error);
//     res.send(body);
// });
/*****************************************************************************************************************/
var server = https.createServer(options, app).listen(config.server.port, function () {
    logger.info('HTTPS started on port ' + config.server.port);
});

server.timeout = 1000 * 60 * 60; // One Hour timeout
// uncought sudden excepotions:
process.on('uncaughtException', function (err) {
    var fname = "uncaughtException";
    logger.error('uncaughtException: ' + err.message);
    logger.error(err);
});
utils.loadAvailableCameras();