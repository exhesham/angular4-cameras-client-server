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



