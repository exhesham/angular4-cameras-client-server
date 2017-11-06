var fs = require('fs');
var crypto = require('crypto');


module.exports.validateParams = function(paramsArr){

    for(var i in paramsArr){
        if(paramsArr[i] == undefined || paramsArr[i] == null){

            return false;
        }
    }
    return true;
}
module.exports.generateId = function (jsonObj){
    return crypto.createHash('md5').update(JSON.stringify(jsonObj)).digest("hex");
}

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
            availableCameras[i] = true
            logger.info("availableCameras contains now ", "/dev/video" + i);
            loadCamera(i);
        }
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

