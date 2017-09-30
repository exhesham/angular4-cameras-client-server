/**
 * Created by hesham on 7/2/2016.
 */
var tcpPortUsed = require('tcp-port-used');
var child_process = require('child_process');
var request = require('request');
var https = require('https');
var account = require(__dirname +'/USRAccountHandler');
var process = require('process');
var fs = require('fs');
var express = require('express');
var CBRWebserverExposedFiles = require(__dirname +'/CBRWebserverExposedFiles.js');
var USRUtils = require(__dirname +'/USRUtils.js');
var path = require("path");
var logger = require('bunyan').createLogger({name: 'USR',streams:[
 {stream: process.stdout,level: 'info'},
 {path:__dirname +"/logs/USR.log",level: 'info'}
 ]});
var bodyParser = require('body-parser');
var pngjs = require("pngjs");
var v4l2camera = require("v4l2camera");
/*includes */

var app = express();
var RELATIVE_DIR = __dirname + "/";

/// Include the express body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//https key and certificate
var options = {
    cert: fs.readFileSync(__dirname + "/../" + 'thunderclouding.crt')  ,
    key: fs.readFileSync(__dirname + "/../" +'thundercloudingemeraldclouding.pem'),
	host: '0.0.0.0'
};
var availableCameras ={};
/*****************************************************************************************************************/
function sendStatusCode(response, statuscode, msg, content_type){
    logger.info( "Called with status code="+statuscode + " and msg="+msg);

    if(content_type == undefined || content_type == null || content_type == ""){
        content_type = "text/html; charset=utf-8";
    }
    response.writeHead(statuscode, {"Content-Type":content_type});
    if(msg != undefined && msg != null){
        response.end(msg);
    }else{
        response.end();
    }
}

/*****************************************************************************************************************/
/*
 Servlet Name: login
 Request Type: POST
 Body:JSON with the next keys:
 {"username":"","password":""}

 */
app.post('/login', function(req, res) {
    var fname = "login_password";
    logger.info( "Login... The request content is:",req.body);
    var requestContent = req.body;
    if(requestContent == undefined || requestContent == null)
    {
        logger.info("received no data at all");
        sendStatusCode(res,401);
        return;
    }
    if(requestContent.username == undefined||requestContent.password == undefined){
        logger.info("didnt receive the login data");
        sendStatusCode(res,401);
        return;

    }
    var password = requestContent.password;
    var username = requestContent.username.toLowerCase();

    logger.info("received the password:"+password + " and the username:"+username);
    // check in the db if the credintials are valid:
    account.ValidateLoginCredintials(password,username).then(function(token){
        res.writeHead(200, {'Set-Cookie': [['session=' + token],['username='+username]]    });
        res.end("OK");
        logger.info("Login Success");

    }).catch(function(err){
        sendStatusCode(res,401, err);
    });


});
/*****************************************************************************************************************/
/*
 Servlet Name: streamvideo
 Request Type: POST
 Body:JSON with the next keys:
 {'cameraName':''}
 */

app.all('/streamvideo', function(req, res) {
    logger.info("streamvideo called:");

    var cameraindex = req.param("cameraindex");
    var sesionTkn = req.param("session");
logger.info("will forward to "+"http://127.0.0.1:777"+cameraindex+"/?action=stream")
    account.isAuthorized(req,"admin")
        .then(function(data){
			if(availableCameras[cameraindex] == true){
				tcpPortUsed.check(44201, '127.0.0.1')
					.then(function(inUse) {
						logger.info('Port 44201 usage: '+inUse);
						if(inUse){
							var streamreq=request({url: "http://127.0.0.1:777"+cameraindex+"/?action=stream"})
								streamreq.pipe(res).on('finish', function(){
								streamreq.end();
							 });
						}else{
							logger.info("open port again");
							loadCamera(cameraindex, function(){
								var streamreq=request({url: "http://127.0.0.1:777"+cameraindex+"/?action=stream"})
								streamreq.pipe(res).on('finish', function(){
									streamreq.end();
								})
							});
						}
					}, function(err) {
						logger.error('Error on check:', err);
						var streamreq=request({url: "http://127.0.0.1:777"+cameraindex+"/?action=stream"})
						streamreq.pipe(res).on('finish', function(){
							streamreq.end();
						})
					});
						
				
			}else{
				logger.info("They camera does not exist. redirecting: ",__dirname + "/images/nocamera.jpg")
				 getFile(__dirname + "/WebClient/images/nocamera.jpg", res, "image/jpg");
			}
            
        })
        .catch(function (err) {
            sendStatusCode(res,401, err);
        });
});
/*****************************************************************************************************************/
/*
 Servlet Name: streamvideoPage
 Request Type: POST
 Body:Empty
 */
/***************************************************************************************/
function requestResource(filename, res) {

    logger.info("Retrieving file:",filename);
    var ext = path.extname(filename);
    var localPath = __dirname + "/";
    var validExtensions = {
        ".html": "text/html"
        , ".js": "application/javascript"
        , ".css": "text/css"
        , ".map": "application/octet-stream"
        , ".woff": "application/octet-stream"
        , ".txt": "text/plain"
        , ".jpg": "image/jpeg"
        , ".gif": "image/gif"
        , ".ico": "image/gif"
        , ".png": "image/png"
    };
    var isValidExt = validExtensions[ext];

    if (isValidExt) {

        //        localPath += path.basename(filename);
        localPath += filename;
        fs.exists(localPath, function (exists) {
            if (exists) {
                logger.info("Serving file: " + localPath);
                getFile(localPath, res, validExtensions[ext]);
            } else {
                logger.error("File not found: " + localPath);
                res.writeHead(404);
                res.end();
            }
        });

    } else {
        logger.error("Invalid file extension detected: " , filename , ", Extension:",ext)
    }
}
/***************************************************************************************/
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
function getSafeFilePath(filename,req) {
    return new Promise(function (resolve, reject) {
        var fileMeta = CBRWebserverExposedFiles.exposed[filename];
        logger.info("getting safe for file:",filename,",Metadata:",fileMeta);
        if (!USRUtils.validateParams([fileMeta])) {
            logger.error({err:"No mapping for file: "+filename});
            reject(null);
        }
        if(fileMeta.loginRequired == true){
            account.isAuthorized(req).then(function (data) {
                if(filename == "" ||filename == "/" || filename == "index.html" || filename == "login.html"){
                    filename = "index.html"
                    logger.info("will serve login.html instead of ",filename,",Metadata:",fileMeta);
                }
                logger.info("you are logged in and you can get the file...");
                resolve(CBRWebserverExposedFiles.exposed[filename].name);
            }).catch(function (data) {
                if(filename == "" ||filename == "/" || filename == "index.html" || filename == "login.html"){
                    filename = "login.html"
                    logger.info("will serve login.html instead of ",filename,",Metadata:",CBRWebserverExposedFiles.exposed[filename].name);
                    resolve(CBRWebserverExposedFiles.exposed[filename].name);
                }else{
                    logger.error("you need to login in order to fet the file: "+filename);
                    reject(null);
                }
            });
        }else{
            logger.info("will serve now ",CBRWebserverExposedFiles.exposed[filename].name);
            resolve(CBRWebserverExposedFiles.exposed[filename].name);
        }
    });
}

app.get('/index.html', function (req, res) {

    var urlpath = req.url.split("?").shift();
    getSafeFilePath(path.basename(urlpath),req).then(function(safeFilepath){
        requestResource(safeFilepath, res);
    }).catch(function(err){
        logger.error({err:err});
        requestResource(CBRWebserverExposedFiles.exposed["login.html"].name, res);
    });
});

/***************************************************************************************/

app.all('/streamvideoPage', function(req, res) {
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
 Servlet Name: availableCameras
 Request Type: GET
 */
app.post('/availablecameras', function(req, res) {
    account.isAuthorized(req,"admin")
        .then(function(data){

        })
        .catch(function (err) {

        });
});
/*****************************************************************************************************************/
/***************************************************************************************/
app.get('/*', function (req, res) {
    var urlpath = req.url.split("?").shift();
    logger.info("Serving ",urlpath)
    getSafeFilePath(path.basename(urlpath),req).then(function(safeFilepath){
        requestResource(safeFilepath, res);
    }).catch(function(err){
        logger.error(err,"Url path:",urlpath);
        sendStatusCode(500, res, "you are trying to access a file illigally!");
    });
});
/*****************************************************************************************************************/
/*
 Servlet Name:
 Request Type: ALL
 */
// app.all('/*', function(req, res) {
//     account.isAuthorized(req,"admin")
//         .then(function(data){
//
//         })
//         .catch(function (err) {
//
//         });
// });
/*****************************************************************************************************************/
function getRelativePath(filename){
    switch(filename){
        case "":
            return "/WebClient/login.html"
            break;
        case "style.css":
            return "/WebClient/css/style.css"
            break;
        case "login.js":
            return "/WebClient/js/login.js"
            break;
        case "favicon.ico":
            return "/WebClient/favicon.ico"
            break;
        case "":
            return "/WebClient//"
            break;
        case "":
            return "/WebClient//"
            break;
        case "":
            return "/WebClient//"
            break;
        case "":
            return "/WebClient//"
            break;
        case "":
            return "/WebClient//"
            break;
        defalt:
            logger.error("Failed to map file:",filename);
            return null;
    }
}
/*****************************************************************************************************************/
app.get('/*', function(req, res) {
    var now = new Date();

    var filename = path.basename(req.url);

    if(filename.indexOf('?')>0){
        filename = filename.substring(0,filename.indexOf('?'));
    }
    var relativePath = getRelativePath(filename);
    if(relativePath == null)
    {
        logger.error("Invalid file extension detected: \"" + ext + "\" file name is " +filename);
        send_status_code(res,404);

    }else{
        var ext = path.extname(relativePath);

        logger.info("Called for file",filename," url: ", req.url ,"ext:",ext);

        var localPath = __dirname + relativePath;

        var validExtensions = {
            ".html" : "text/html",
            ".js": "application/javascript",
            ".css": "text/css",
            ".map": "application/octet-stream",
            ".mapfile": "text/css",
            ".woff": "text/css",
            ".otf": "text/css",
            ".eot": "text/css",
            ".svg": "text/css",
            ".ttf": "text/css",
            ".txt": "text/plain",
            ".jpg": "image/jpeg",
            ".gif": "image/gif",
            ".ico": "icon/ico",
            ".png": "image/png"
        };
        var isValidExt = validExtensions[ext];

        if (isValidExt != undefined &&isValidExt != null && relativePath != null ) {

            logger.info("relativePath = ", relativePath);

            fs.exists(localPath, function(exists) {
                if(exists) {
                    logger.info("Serving file: " + localPath +" with mime-type:"+validExtensions[ext]);
                    getFile(localPath, res, validExtensions[ext]);
                } else {
                    logger.error("File not found. localPath =" , localPath);
                    send_status_code(res,404);

                }
            });

        } else {
            logger.info("Invalid file extension detected: \"" + ext + "\" file name is " +filename);
            send_status_code(res,404);
        }
    }

});
/*****************************************************************************************************************/
function send_status_code(response,statuscode,msg,content_type){
    logger.info(  "Called with status code="+statuscode + " and msg="+msg);

    if(content_type == undefined || content_type == null || content_type == ""){
        content_type = "text/html; charset=utf-8";
    }
    response.writeHead(statuscode, {"Content-Type":content_type});
    if(msg != undefined && msg != null){
        response.end(msg);
    }else{
        response.end();
    }
}
/*****************************************************************************************************************/
function send_logout_redirect(res){
    logger.info("Called...");
    res.clearCookie("session");
    res.clearCookie("username");

    res.redirect('login.html');

}
/*****************************************************************************************************************/
function getFile(localPath, res, mimeType) {
    var fname = "getFile";
    fs.readFile(localPath, function(err, contents) {
        if(!err) {
            res.setHeader("Content-Length", contents.length);
            if(mimeType == undefined || mimeType == null )
            {
                mimeType = "text/css";
            }
            res.setHeader("Content-Type", mimeType);
            res.statusCode = 200;
            res.end(contents);
            logger.info("file "+localPath +" was sent successfully with mymtype "+mimeType);
        } else {
            res.statusCode = 500;
            res.end();
        }
    });
}

function loadAvailableCameras(){
    for(i=0;i<4;i++){
        if (fs.existsSync("/dev/video"+i)) {
            availableCameras[i] = true
            logger.info("availableCameras contains now ","/dev/video"+i);
			 loadCamera(i);
        }
    }
}
var cam = null;
function loadCamera(index,callback){
	logger.info("loading camera #",index)
	logger.info("running script:",__dirname + '/scripts/startvid '+ index)
    child_process.exec([__dirname + '/scripts/startvid '+ index], function(err, out, code) {
        logger.error(err);
        logger.info(out,err);
		
        //process.exit(code);
    });
	if(callback != undefined){
		callback();
	}
}


var server = https.createServer(options, app).listen(4330, function () {
    logger.info('HTTPS started on port 4430');
});
server.timeout = 1000*60*60; // One Hour timeout

// uncought sudden excepotions:
process.on('uncaughtException', function(err){
    var fname = "uncaughtException";
    logger.error('uncaughtException: ' + err.message);
    logger.error(err);
    //process.exit(1);             // exit with error
});

loadAvailableCameras();