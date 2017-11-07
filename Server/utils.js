var fs = require('fs');
var crypto = require('crypto');
var child_process = require('child_process');
var ini = require('ini');

var process = require('process');
var fs = require('fs');
var ini = require('ini');

/*configurations*/
var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'))


/*logger*/
var logger = require('bunyan').createLogger({
    name: 'USR', streams: [
        {stream: process.stdout, level: 'info'},
        {path: config.server.logs, level: 'info'}
    ]
});
/*****************************************************************************************************************/
module.exports.validateParams = function(paramsArr){
    for(var i in paramsArr){
        if(paramsArr[i] == undefined || paramsArr[i] == null){
            return false;
        }
    }
    return true;
}
/*****************************************************************************************************************/
module.exports.generateId = function (jsonObj){
    return crypto.createHash('md5').update(JSON.stringify(jsonObj)).digest("hex");
}
/*****************************************************************************************************************/
module.exports.createDir = function(dir){
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    return true;
}
/*****************************************************************************************************************/
module.exports.loadCamera = function(index, callback) {
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
/*****************************************************************************************************************/
module.exports.loadAvailableCameras = function() {
    for (i = 0; i < 4; i++) {
        if (fs.existsSync("/dev/video" + i)) {
            exports.loadCamera(i);
        }
    }
}

/*****************************************************************************************************************/
module.exports.getAvailableCameras= function() {
    var res = [];
    for (i = 0; i < 4; i++) {
        if (fs.existsSync("/dev/video" + i)) {
            res.add(i)
        }
    }
    return res;
}
/*****************************************************************************************************************/
module.exports.sendStatusCode = function(response, statuscode, msg, content_type){
    logger.info( "Called with status code="+statuscode + " and msg="+msg);

    if(content_type == undefined || content_type == null || content_type == ""){
        content_type = "text/html; charset=utf-8";
    }
    response.writeHead(statuscode, {"Content-Type":content_type});
    if(msg != undefined && msg != null){
        response.end(JSON.stringify(msg));
    }else{
        response.end();
    }
}

/*****************************************************************************************************************/
module.exports.getFile = function(localPath, res, mimeType) {
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

