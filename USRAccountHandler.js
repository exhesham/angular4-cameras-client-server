/**
 * Created by hesham on 7/2/2016.
 */
var crypto = require('crypto')
var logger = require('bunyan').createLogger({name: 'USR',stream: process.stdout, level: 'info','src':true});
var usersRepository  = {
    "admin" : {"password":"theysentmedowntotheriver","role":"admin"}
}
var sessions = {};
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;
    logger.info("rc:",rc);
    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}
module.exports.ValidateLoginCredintials = function(password,username){
    return new Promise(function(resolve,reject){
        logger.info("Input params:",password,username);
        if(usersRepository.hasOwnProperty(username)){
            if(usersRepository[username].password == [password]){
                crypto.randomBytes(48, function(ex, buf) {
                    var token = buf.toString('hex');
                    logger.info("New session was added...sending a redirect...");
                    sessions[username] = {"session":token,"role":usersRepository[username].role};

                    resolve(token);
                });

            }else{
                reject("Wrong Password");
            }
        }else{
            reject("Invalid Username");
        }
    });
}
module.exports.isAuthorized = function(request,role){

    return new Promise(function(resolve,reject) {
        var cookies = parseCookies(request);
        if (cookies == undefined || cookies == null) {
            logger.error("cookies undefined! ");
            reject("undefined cookie");
            return;
        }
        logger.info("All cookies are: " + JSON.stringify(cookies));
        logger.info("the session in the cookie is: " + cookies["session"]);
        if (cookies["session"] == undefined) {
            logger.error("No session in cookie");

            reject("no session in cookie");

        } else {
            logger.info("there is a sessoion, validating it");
            if(sessions[cookies["username"]].session == cookies["session"]){
                if(role  == "admin"){
                    if(sessions[cookies["username"]].role == "admin"){
                        logger.info("authorized session for admin, resolving");
                        resolve(null);
                    }else{
                        logger.error("you must be admin to be authorized!");
                        reject ("you must be admin to be authorized ");
                    }
                }else{
                    logger.info("authorized session, resolving");
                    resolve(null);
                }
            }else{
                logger.error("expired session in cookie");
                reject("expired session in cookie");
            }
        }
    });
}
