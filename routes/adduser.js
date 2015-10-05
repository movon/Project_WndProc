var express = require('express');
var router = express.Router();
var validator = require('validator');
var https = require('https');
var crypto = require('crypto');
var pg = require('pg');



/* GET after registration page. */
router.get('/', function(req, res, next) {
    'use strict';
    var extra = getExtra(req);
    res.render('adduser', { title: 'Thank you for signing up to our website!' , extra:extra, username:req.session.username});
});

var SECRET = "6Ld-IQoTAAAAAJ_XyAF6r9lYeI3xyBI_FF7B_94D";

// Helper function to make API call to recatpcha and check response
function verifyRecaptcha(key, callback) {
    'use strict';
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

//Handle POST request to sign up
router.post('/', function(req, res) {
    'use strict';
    var extra = getExtra(req);
    verifyRecaptcha(req.body["g-recaptcha-response"], function(success) {
        if (success) {
            pg.connect(process.env.DATABASE_URL, function (err, connection, done) {
                if (err) {
                    done();
                    res.json({"code": 100, "status": "Error in connection database"});
                } else {
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
                        if (rows.rows.length > 0) {
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
                        var salt = crypto.randomBytes(32).toString('hex');
                        var saltpassword =  req.body.password + salt;
                        var hashedpassword = crypto.createHash('md5').update(saltpassword).digest('hex');
                        console.log("insert into users(username, hashed, email, privileges, salt) values('" + req.body.username + "','" + hashedpassword + "','" + req.body.email + "'," + "'user','" + salt + "');");
                        connection.query("insert into users(username, hashed, email, privileges, salt) values('" + req.body.username + "','" + hashedpassword + "','" + req.body.email + "'," + "'user','" + salt + "');", function (err, rows) {
                            console.log("released connection");
                            if (!err) {
                                console.log("sent him thank you");
                                res.render('adduser', {
                                    title: 'Thank you for signing up to our website!',
                                    extra: extra,
                                    username: req.session.username
                                });
                            } else {
                                console.log(err);
                            }
                        });

                    });
                }
            });
        } else {
            res.render('register', {
                title: 'Register',
                error: '<li style=\"color: red\">Recaptcha failed.</li>',
                extra: extra,
                username: req.session.username
            });
            }
        });


    });




module.exports = router;