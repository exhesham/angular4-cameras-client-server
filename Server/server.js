/**
 * Created by hesham on 7/2/2016.
 */

/*Imports*/
var tcpPortUsed = require('tcp-port-used');
var child_process = require('child_process');
var request = require('request');
var https = require('https');
var account = require(__dirname + '/accounts');
var process = require('process');
var fs = require('fs');
var ini = require('ini');
var bodyParser = require('body-parser');
var pngjs = require("pngjs");
var express = require('express');
var path = require("path");


/*Internal Imports*/
var CBRWebserverExposedFiles = require(__dirname + '/exposed.js');
var USRUtils = require(__dirname + '/utils.js');


/*def*/
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))
var logger = require('bunyan').createLogger({
    name: 'USR', streams: [
        {stream: process.stdout, level: 'info'},
        {path: config.server.logs, level: 'info'}
    ]
});


var app = express();

/// Include the express body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies


// bootstraping
app.use(express.static('../Client/public'));
app.use(bodyParser.json());


//https key and certificate
var options = {
    cert: fs.readFileSync(config.server.cert_path),
    key: fs.readFileSync(config.server.key_path),
    host: '0.0.0.0'
};
var availableCameras = {};
/*****************************************************************************************************************/
/*
 Servlet Name: login
 Request Type: POST
 Body:JSON with the next keys:
 {"username":"","password":""}

 */
app.post('/login', function (req, res) {
    var fname = "login_password";
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

    logger.info("received the password:" + password + " and the username:" + username);
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
 Servlet Name: streamvideo
 Request Type: POST
 Body:JSON with the next keys:
 {'cameraName':''}
 */

app.all('/streamvideo', function (req, res) {
    logger.info("streamvideo called:");

    var cameraindex = req.param("cameraindex");
    var sesionTkn = req.param("session");
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
                            loadCamera(cameraindex, function () {
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
                getFile(__dirname + "/WebClient/images/nocamera.jpg", res, "image/jpg");
            }

        })
        .catch(function (err) {
            sendStatusCode(res, 401, err);
        });
});
/*****************************************************************************************************************/
/*
 Servlet Name: streamvideoPage
 Request Type: POST
 Body:Empty
 */
/***************************************************************************************/

app.all('/streamvideoPage', function (req, res) {
    logger.info("streamvideoPage called");
    res.writeHead(200, {
        "content-type": "text/html;charset=utf-8",
    });
    res.end([
        "<!doctype html>",
        "<html><head><meta charset='utf-8'/>",
        "<script>(", script.toString(), ")()</script>",
        "</head><body>",
        "<img id='cam' width='352' height='288' />",
        "</body></html>",
    ].join(""));
});
/*****************************************************************************************************************/
/*
 Servlet Name: /cameras/list
 Request Type: GET
 */
app.post('/cameras/list', function (req, res) {
    account.isAuthorized(req, "admin")
        .then(function (data) {
            return ["Cam1", "Cam2", "Cam3", "Cam4"];
        })
        .catch(function (err) {
            return [];
        });
});
/*****************************************************************************************************************/
function getFile(localPath, res, mimeType) {
    fs.readFile(localPath, function (err, contents) {
        if (!err) {
            res.setHeader("Content-Length", contents.length);
            res.setHeader("Content-Type", mimeType);
            res.statusCode = 200;
            res.end(contents);
        } else {
            res.writeHead(500);
            res.end();
        }
    });
}

/*****************************************************************************************************************/
function loadAvailableCameras() {
    for (i = 0; i < 4; i++) {
        if (fs.existsSync("/dev/video" + i)) {
            availableCameras[i] = true
            logger.info("availableCameras contains now ", "/dev/video" + i);
            loadCamera(i);
        }
    }
}
var cam = null;
function loadCamera(index, callback) {
    logger.info("loading camera #", index)
    logger.info("running script:", __dirname + '/scripts/startvid ' + index)
    child_process.exec([__dirname + '/scripts/startvid ' + index], function (err, out, code) {
        logger.error(err);
        logger.info(out, err);

        //process.exit(code);
    });
    if (callback != undefined) {
        callback();
    }
}

request(options, function (error, response, body) {
    if (error) throw new Error(error);
    res.send(body);
});


var server = https.createServer(options, app).listen(config.server.port, function () {
    logger.info('HTTPS started on port ' + config.server.port);
});
server.timeout = 1000 * 60 * 60; // One Hour timeout

// uncought sudden excepotions:
process.on('uncaughtException', function (err) {
    var fname = "uncaughtException";
    logger.error('uncaughtException: ' + err.message);
    logger.error(err);
    //process.exit(1);             // exit with error
});

loadAvailableCameras();