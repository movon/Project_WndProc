var express = require('express');
var router = express.Router();
var validator = require('validator');
var querystring = require('querystring');
var http = require('http');
var https = require('https');

function sendToGoogle(userIP, recaptcha) {
    console.log("Sent to google");
    var data = querystring.stringify({
        secret: '6LfyPAgTAAAAANO_PHWDI4eGtC60mG5RSyB6tMqC',
        response: recaptcha,
        remoteip: userIP
    });

    var options = {
        host: 'https://www.google.com',
        port: 80,
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log("body: " + chunk);
        });
    });

    req.write(data);
    req.end();
}
/* GET home page. */
router.get('/', function(req, res, next) {
    extra = getExtra(req);
    res.render('adduser', { title: 'Thank you for signing up to our website!' , extra:extra, username:req.session.username});
});


var mysql = require('mysql');
mypass = 'winasmfspopaw256!';

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : '149.78.95.151',
    user     : 'talbor49',
    password : mypass,
    database : 'userlogin',
    debug    :  false
});

//Handle POST request to sign up
router.post('/', function(req, res, next){
    verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
        if(success){
            extra = getExtra(req);
            pool.getConnection(function(err,connection) {
                if (err) {
                    connection.release();
                    res.json({"code": 100, "status": "Error in connection database"});
                    return;
                }
                else {
                    var error = '';
                    if (!validator.isEmail(req.body.email)) {
                        error += '<li style=\"color: red\">Invalid Email.</li>';
                    }
                    if (!validator.isAlphanumeric(req.body.username)) {
                        error += '<li style=\"color: red\">Username should only contain letters and numbers.</li>';
                    }
                    if (!validator.isAscii(req.body.password)) {
                        error += '<li style=\"color: red\">Password contains invalid characters.</li>';
                    }
                    connection.query("select * from users where username='" + req.body.username + "';", function (err, rows) {
                        if (rows.length > 0) {
                            error += '<li style=\"color: red\">Username already taken.</li>';
                        }
                        if (error.length > 0) {
                            res.render('register', {
                                title: 'Register',
                                error: error,
                                extra: extra,
                                username: req.session.username
                            });
                            return;
                        }
                        console.log("insert into users(username, password, email, privileges) values('" + req.body.username + "','" + req.body.password + "','" + req.body.email + "'," + "'user');");
                        connection.query("insert into users(username, password, email, privileges) values('" + req.body.username + "','" + req.body.password + "','" + req.body.email + "'," + "'user');", function (err, rows) {
                            connection.release();
                            if (!err) {
                                res.render('adduser', {
                                    title: 'Thank you for signing up to our website!',
                                    extra: extra,
                                    username: req.session.username
                                });
                            }
                        });

                    });
                }
            });

                }
        else{
            res.render('register', {
                title: 'Register',
                error: '<li style=\"color: red\">Recaptcha failed.</li>',
                extra: extra,
                username: req.session.username
            });
            }
        });


    });
var SECRET = "6Lf1SAgTAAAAAGNkmjOGq7xLsbdWOXam24udQmgO";

// Helper function to make API call to recatpcha and check response
function verifyRecaptcha(key, callback) {
    https.get("https://www.google.com/recaptcha/api/siteverify?secret=" + SECRET + "&response=" + key, function(res) {
        var data = "";
        res.on('data', function (chunk) {
            data += chunk.toString();
        });
        res.on('end', function() {
            try {
                var parsedData = JSON.parse(data);
                callback(parsedData.success);
            } catch (e) {
                callback(false);
            }
        });
    });
}


module.exports = router;